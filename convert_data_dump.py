#!/usr/bin/env python3
"""
convert_data_dump.py

Reads a PostgreSQL/Supabase data-only dump (data.sql) produced with:
    supabase db dump --linked --data-only --use-copy -f data.sql

Converts integer primary keys to UUIDs, remaps all foreign keys, and writes
a clean uuid_data.sql ready to execute against the new UUID-based schema.

Usage:
    python convert_data_dump.py data.sql uuid_data.sql
"""

import re
import sys
import uuid
from collections import defaultdict

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

# Tables whose IDs are already UUIDs — do NOT remap their PKs
ALREADY_UUID_TABLES = {"users", "notifications", "videos"}

# Tables that need new UUID PKs generated
NEEDS_UUID_PK = {
    "addresses", "brands", "carousels", "cart", "categories", "colors",
    "coupons", "inventory", "order_items", "orders", "product_colors",
    "product_images", "product_sizes", "products", "reviews", "sizes",
    "subcategories", "wishlist",
}

# Foreign key column -> parent table
# Format: (child_table, column_name) -> parent_table
FK_MAP = {
    ("carousels",       "brand_id"):          "brands",
    ("cart",            "product_id"):        "products",
    ("cart",            "product_size_id"):   "product_sizes",
    ("cart",            "product_color_id"):  "product_colors",
    ("inventory",       "product_id"):        "products",
    ("inventory",       "product_size_id"):   "product_sizes",
    ("inventory",       "product_color_id"):  "product_colors",
    ("order_items",     "order_id"):          "orders",
    ("order_items",     "product_id"):        "products",
    ("order_items",     "product_size_id"):   "product_sizes",
    ("order_items",     "product_color_id"):  "product_colors",
    ("orders",          "address_id"):        "addresses",
    ("orders",          "coupon_id"):         "coupons",
    ("product_colors",  "product_id"):        "products",
    ("product_colors",  "color_id"):          "colors",
    ("product_images",  "product_id"):        "products",
    ("product_images",  "color_id"):          "colors",
    ("product_sizes",   "product_id"):        "products",
    ("product_sizes",   "size_id"):           "sizes",
    ("products",        "category_id"):       "categories",
    ("products",        "subcategory_id"):    "subcategories",
    ("products",        "brand_id"):          "brands",
    ("reviews",         "order_item_id"):     "order_items",
    ("reviews",         "product_id"):        "products",
    ("subcategories",   "category_id"):       "categories",
    ("wishlist",        "product_id"):        "products",
}

# Columns that are user UUIDs — pass through unchanged
USER_UUID_COLUMNS = {
    "user_id", "created_by", "updated_by",
}

# notifications.entity_type -> parent table name for entity_id remapping
NOTIFICATION_ENTITY_TYPE_MAP = {
    "order":       "orders",
    "order_item":  "order_items",
    "product":     "products",
    "address":     "addresses",
}

# Desired restore order
RESTORE_ORDER = [
    "brands",
    "categories",
    "colors",
    "coupons",
    "sizes",
    "subcategories",
    "products",
    "product_sizes",
    "product_colors",
    "product_images",
    "addresses",
    "carousels",
    "inventory",
    "orders",
    "order_items",
    "reviews",
    "cart",
    "wishlist",
    "notifications",
    "videos",
    "users",
]

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def new_uuid() -> str:
    return str(uuid.uuid4())


def parse_copy_header(line: str):
    """
    Parse:  COPY "public"."tablename" ("col1", "col2", ...) FROM stdin;
    Returns (schema, table, [col1, col2, ...]) or None if not a COPY line.
    """
    pattern = r'COPY\s+"?(\w+)"?\."?(\w+)"?\s+\(([^)]+)\)\s+FROM\s+stdin'
    m = re.match(pattern, line.strip(), re.IGNORECASE)
    if not m:
        return None
    schema = m.group(1)
    table = m.group(2)
    cols_raw = m.group(3)
    cols = [c.strip().strip('"') for c in cols_raw.split(",")]
    return schema, table, cols


def pg_copy_decode(value: str):
    """
    Decode a single PostgreSQL COPY field value.
    Returns None for \\N (SQL NULL), otherwise the Python string.
    Handles: \\t, \\n, \\r, \\\\, and octal escapes.
    """
    if value == "\\N":
        return None
    # Process backslash escapes
    result = []
    i = 0
    while i < len(value):
        if value[i] == "\\" and i + 1 < len(value):
            nxt = value[i + 1]
            if nxt == "t":
                result.append("\t")
                i += 2
            elif nxt == "n":
                result.append("\n")
                i += 2
            elif nxt == "r":
                result.append("\r")
                i += 2
            elif nxt == "\\":
                result.append("\\")
                i += 2
            elif nxt.isdigit():
                # Octal escape \NNN
                octal = value[i+1:i+4]
                result.append(chr(int(octal, 8)))
                i += 4
            else:
                result.append(nxt)
                i += 2
        else:
            result.append(value[i])
            i += 1
    return "".join(result)


def pg_copy_encode(value) -> str:
    """
    Encode a Python value back to PostgreSQL COPY text format.
    None -> \\N
    Strings: escape backslash, tab, newline, carriage return.
    """
    if value is None:
        return "\\N"
    s = str(value)
    s = s.replace("\\", "\\\\")
    s = s.replace("\t", "\\t")
    s = s.replace("\n", "\\n")
    s = s.replace("\r", "\\r")
    return s


def sql_literal(value) -> str:
    """
    Render a value as a SQL literal suitable for INSERT VALUES.
    None -> NULL
    Strings: escaped with single-quote doubling.
    Numbers, booleans, UUIDs: pass through (as string).
    """
    if value is None:
        return "NULL"
    s = str(value)
    # Escape single quotes
    s = s.replace("'", "''")
    return f"'{s}'"


# ---------------------------------------------------------------------------
# Parser
# ---------------------------------------------------------------------------

def parse_dump(filepath: str):
    """
    Parse data.sql and return a dict:
        {
          table_name: {
            "schema": str,
            "columns": [str, ...],
            "rows": [[decoded_value, ...], ...],
          }
        }
    Only public.* tables are returned.
    Tables from auth.* are silently ignored.
    If a table appears multiple times, rows are concatenated.
    """
    tables = {}

    with open(filepath, "r", encoding="utf-8", errors="replace") as fh:
        lines = fh.readlines()

    i = 0
    while i < len(lines):
        line = lines[i].rstrip("\n")
        header = parse_copy_header(line)
        if header is None:
            i += 1
            continue

        schema, table, cols = header
        i += 1  # move past COPY line

        # Collect raw data lines until terminator
        raw_rows = []
        while i < len(lines):
            data_line = lines[i].rstrip("\n")
            i += 1
            if data_line == "\\.":
                break
            raw_rows.append(data_line)

        if schema.lower() != "public":
            # Silently skip auth.* and other schemas
            continue

        # Decode rows
        decoded_rows = []
        for raw in raw_rows:
            fields = raw.split("\t")
            if len(fields) != len(cols):
                # Try to be lenient about trailing empty fields
                while len(fields) < len(cols):
                    fields.append("\\N")
                fields = fields[:len(cols)]
            decoded = [pg_copy_decode(f) for f in fields]
            decoded_rows.append(decoded)

        if table not in tables:
            tables[table] = {"schema": schema, "columns": cols, "rows": []}
        tables[table]["rows"].extend(decoded_rows)

    return tables


# ---------------------------------------------------------------------------
# UUID Mapping Builder
# ---------------------------------------------------------------------------

def build_uuid_maps(tables: dict) -> dict:
    """
    For each table in NEEDS_UUID_PK, build old_id -> new_uuid mapping.
    Returns { table_name: { old_id_str: new_uuid_str } }
    """
    maps = {}
    for tname in NEEDS_UUID_PK:
        if tname not in tables:
            maps[tname] = {}
            continue
        info = tables[tname]
        cols = info["columns"]
        if "id" not in cols:
            maps[tname] = {}
            continue
        id_idx = cols.index("id")
        mapping = {}
        for row in info["rows"]:
            old_id = row[id_idx]
            if old_id is not None and old_id not in mapping:
                mapping[old_id] = new_uuid()
        maps[tname] = mapping
    return maps


# ---------------------------------------------------------------------------
# Row Transformer
# ---------------------------------------------------------------------------

def transform_tables(tables: dict, uuid_maps: dict) -> dict:
    """
    For each public table, transform rows:
      - Replace PK 'id' with UUID from uuid_maps (if table is in NEEDS_UUID_PK)
      - Replace FK columns using FK_MAP
      - Handle notifications.entity_id specially
      - Preserve existing UUIDs for ALREADY_UUID_TABLES
      - Preserve NULL foreign keys
    Returns a new tables dict with transformed rows.
    Returns also stats dict.
    """
    errors = []
    stats = {
        "fk_mapped": 0,
        "fk_null_preserved": 0,
        "notifications_transformed": 0,
        "unknown_entity_types": set(),
    }

    transformed = {}

    for tname, info in tables.items():
        cols = info["columns"]
        old_rows = info["rows"]
        new_rows = []

        for row in old_rows:
            new_row = list(row)  # copy

            for col_idx, col in enumerate(cols):
                val = row[col_idx]

                # ---- Primary key transformation ----
                if col == "id" and tname in NEEDS_UUID_PK:
                    if val is None:
                        errors.append(
                            f"ERROR: NULL primary key in {tname} row: {row}"
                        )
                        new_row[col_idx] = None
                    elif val in uuid_maps.get(tname, {}):
                        new_row[col_idx] = uuid_maps[tname][val]
                    else:
                        errors.append(
                            f"ERROR: PK value '{val}' in {tname} not found in uuid_map"
                        )
                    continue  # skip FK checks for PK column

                # ---- Skip user UUID columns ----
                if col in USER_UUID_COLUMNS:
                    continue  # pass through unchanged

                # ---- Notifications entity_id special handling ----
                if tname == "notifications" and col == "entity_id":
                    if "entity_type" in cols:
                        et_idx = cols.index("entity_type")
                        entity_type = row[et_idx]
                    else:
                        entity_type = None

                    if val is None:
                        stats["fk_null_preserved"] += 1
                        continue

                    if entity_type is None:
                        errors.append(
                            f"ERROR: notifications row has entity_id='{val}' but no entity_type"
                        )
                        continue

                    parent_table = NOTIFICATION_ENTITY_TYPE_MAP.get(entity_type)
                    if parent_table is None:
                        stats["unknown_entity_types"].add(entity_type)
                        errors.append(
                            f"ERROR: Unknown notifications.entity_type='{entity_type}'"
                        )
                        continue

                    parent_map = uuid_maps.get(parent_table, {})
                    if val not in parent_map:
                        errors.append(
                            f"ERROR: notifications.entity_id='{val}' (entity_type='{entity_type}') "
                            f"not found in {parent_table} map"
                        )
                        continue

                    new_row[col_idx] = parent_map[val]
                    stats["notifications_transformed"] += 1
                    continue

                # ---- Foreign key transformation ----
                fk_key = (tname, col)
                if fk_key in FK_MAP:
                    parent_table = FK_MAP[fk_key]
                    if val is None:
                        stats["fk_null_preserved"] += 1
                        continue
                    parent_map = uuid_maps.get(parent_table, {})
                    if val not in parent_map:
                        errors.append(
                            f"ERROR: {tname}.{col}='{val}' not found in {parent_table} map"
                        )
                        continue
                    new_row[col_idx] = parent_map[val]
                    stats["fk_mapped"] += 1

            new_rows.append(new_row)

        transformed[tname] = {
            "schema": info["schema"],
            "columns": cols,
            "rows": new_rows,
        }

    return transformed, stats, errors


# ---------------------------------------------------------------------------
# SQL Writer
# ---------------------------------------------------------------------------

def write_sql(output_path: str, tables: dict, restore_order: list):
    """
    Write transformed tables to output_path as INSERT statements
    inside a single transaction.
    """
    # Build set of available tables
    available = set(tables.keys())

    # Tables in order + any leftover not in RESTORE_ORDER
    ordered = [t for t in restore_order if t in available]
    extras = sorted(available - set(ordered))
    final_order = ordered + extras

    with open(output_path, "w", encoding="utf-8") as fh:
        fh.write("-- Generated by convert_data_dump.py\n")
        fh.write("-- Integer IDs -> UUIDs conversion\n\n")
        fh.write("BEGIN;\n\n")

        for tname in final_order:
            info = tables[tname]
            cols = info["columns"]
            rows = info["rows"]

            if not rows:
                fh.write(f"-- (no rows for public.{tname})\n\n")
                continue

            fh.write(f"-- Table: public.{tname} ({len(rows)} rows)\n")

            col_list = ", ".join(f'"{c}"' for c in cols)

            # Write in batches of 500 to avoid huge single statements
            BATCH = 500
            for batch_start in range(0, len(rows), BATCH):
                batch = rows[batch_start:batch_start + BATCH]
                fh.write(
                    f'INSERT INTO public."{tname}" ({col_list}) VALUES\n'
                )
                value_lines = []
                for row in batch:
                    vals = ", ".join(sql_literal(v) for v in row)
                    value_lines.append(f"  ({vals})")
                fh.write(",\n".join(value_lines))
                fh.write("\nON CONFLICT DO NOTHING;\n\n")

        fh.write("COMMIT;\n")


# ---------------------------------------------------------------------------
# Summary Printer
# ---------------------------------------------------------------------------

def print_summary(tables_parsed, uuid_maps, stats, errors):
    print("\n" + "=" * 60)
    print("PARSED TABLES:")
    for tname, info in sorted(tables_parsed.items()):
        print(f"  {tname}: {len(info['rows'])} rows")

    print("\nGENERATED UUID MAPPINGS:")
    for tname, mapping in sorted(uuid_maps.items()):
        print(f"  {tname}: {len(mapping)} IDs mapped")

    print(f"\nForeign keys successfully mapped : {stats['fk_mapped']}")
    print(f"NULL foreign keys preserved      : {stats['fk_null_preserved']}")
    print(f"Notifications entity_id remapped : {stats['notifications_transformed']}")

    if stats["unknown_entity_types"]:
        print(f"\nWARNING: Unknown notification entity types encountered:")
        for et in sorted(stats["unknown_entity_types"]):
            print(f"  - {et}")

    print("\nERRORS:")
    if errors:
        for e in errors:
            print(f"  {e}")
    else:
        print("  none")
    print("=" * 60 + "\n")


# ---------------------------------------------------------------------------
# Row count verification
# ---------------------------------------------------------------------------

def verify_row_counts(original: dict, transformed: dict) -> list:
    mismatches = []
    for tname in original:
        orig_count = len(original[tname]["rows"])
        trans_count = len(transformed.get(tname, {}).get("rows", []))
        if orig_count != trans_count:
            mismatches.append(
                f"ROW COUNT MISMATCH in {tname}: original={orig_count}, transformed={trans_count}"
            )
    return mismatches


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    if len(sys.argv) != 3:
        print("Usage: python convert_data_dump.py data.sql uuid_data.sql")
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]

    print(f"Reading: {input_path}")
    tables_parsed = parse_dump(input_path)
    print(f"Parsed {len(tables_parsed)} public.* table(s).")

    print("Building UUID mappings...")
    uuid_maps = build_uuid_maps(tables_parsed)

    print("Transforming rows...")
    transformed, stats, errors = transform_tables(tables_parsed, uuid_maps)

    # Verify row counts
    count_mismatches = verify_row_counts(tables_parsed, transformed)
    if count_mismatches:
        errors.extend(count_mismatches)

    print_summary(tables_parsed, uuid_maps, stats, errors)

    if errors:
        print("STOPPING: Errors detected. uuid_data.sql was NOT written.")
        print("Fix the above errors and re-run.")
        sys.exit(1)

    print(f"Writing: {output_path}")
    write_sql(output_path, transformed, RESTORE_ORDER)
    print("Done.")


if __name__ == "__main__":
    main()
