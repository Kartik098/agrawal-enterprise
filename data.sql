SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict s5z9Kh2AwbI8TnU31hrfgFHhzQMkz2sGXRBWPYj8OBvdCpzh3ABknj5jNSl6aja

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") FROM stdin;
\.


--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."custom_oauth_providers" ("id", "provider_type", "identifier", "name", "client_id", "client_secret", "acceptable_client_ids", "scopes", "pkce_enabled", "attribute_mapping", "authorization_params", "enabled", "email_optional", "issuer", "discovery_url", "skip_nonce_check", "cached_discovery", "discovery_cached_at", "authorization_url", "token_url", "userinfo_url", "jwks_uri", "created_at", "updated_at", "custom_claims_allowlist") FROM stdin;
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."flow_state" ("id", "user_id", "auth_code", "code_challenge_method", "code_challenge", "provider_type", "provider_access_token", "provider_refresh_token", "created_at", "updated_at", "authentication_method", "auth_code_issued_at", "invite_token", "referrer", "oauth_client_state_id", "linking_target_id", "email_optional") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") FROM stdin;
00000000-0000-0000-0000-000000000000	132f5f5b-74b2-456a-9f86-976df91c3809	authenticated	authenticated	kartikgupta1805@gmail.com	$2a$10$BacyJTno1Alv.EHqzWeeKerpVAGO.LGn8pWGy4Dvc4D0Zhah0aOxO	2026-09-12 11:16:03.45114+00	\N		\N		\N			\N	2026-09-12 11:16:03.456381+00	{"provider": "email", "providers": ["email"]}	{"sub": "132f5f5b-74b2-456a-9f86-976df91c3809", "email": "kartikgupta1805@gmail.com", "phone": "9484634082", "full_name": "Kartik Gupta", "email_verified": true, "phone_verified": false}	\N	2026-09-12 11:16:03.435813+00	2026-09-13 09:59:32.075414+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") FROM stdin;
132f5f5b-74b2-456a-9f86-976df91c3809	132f5f5b-74b2-456a-9f86-976df91c3809	{"sub": "132f5f5b-74b2-456a-9f86-976df91c3809", "email": "kartikgupta1805@gmail.com", "phone": "9484634082", "full_name": "Kartik Gupta", "email_verified": false, "phone_verified": false}	email	2026-09-12 11:16:03.446605+00	2026-09-12 11:16:03.446667+00	2026-09-12 11:16:03.446667+00	05641b0d-abe6-43d5-9ba1-4a492e2aae33
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."instances" ("id", "uuid", "raw_base_config", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."oauth_clients" ("id", "client_secret_hash", "registration_type", "redirect_uris", "grant_types", "client_name", "client_uri", "logo_uri", "created_at", "updated_at", "deleted_at", "client_type", "token_endpoint_auth_method") FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") FROM stdin;
9b56ac4d-62ca-43cf-b092-e9a06edaebe0	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-12 11:16:03.45768+00	2026-09-13 09:59:32.102163+00	\N	aal1	\N	2026-09-13 09:59:32.10206	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	103.39.128.80	\N	\N	\N	\N	\N
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") FROM stdin;
9b56ac4d-62ca-43cf-b092-e9a06edaebe0	2026-09-12 11:16:03.466669+00	2026-09-12 11:16:03.466669+00	password	889976df-ed57-41eb-83d2-05922bfc9f2d
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."mfa_factors" ("id", "user_id", "friendly_name", "factor_type", "status", "created_at", "updated_at", "secret", "phone", "last_challenged_at", "web_authn_credential", "web_authn_aaguid", "last_webauthn_challenge_data") FROM stdin;
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."mfa_challenges" ("id", "factor_id", "created_at", "verified_at", "ip_address", "otp_code", "web_authn_session_data") FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."oauth_authorizations" ("id", "authorization_id", "client_id", "user_id", "redirect_uri", "scope", "state", "resource", "code_challenge", "code_challenge_method", "response_type", "status", "authorization_code", "created_at", "expires_at", "approved_at", "nonce") FROM stdin;
\.


--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."oauth_client_states" ("id", "provider_type", "code_verifier", "created_at") FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."oauth_consents" ("id", "user_id", "client_id", "scopes", "granted_at", "revoked_at") FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."one_time_tokens" ("id", "user_id", "token_type", "token_hash", "relates_to", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") FROM stdin;
00000000-0000-0000-0000-000000000000	5	7a6ikssq4hmy	132f5f5b-74b2-456a-9f86-976df91c3809	t	2026-09-12 11:16:03.461506+00	2026-09-12 12:14:21.48748+00	\N	9b56ac4d-62ca-43cf-b092-e9a06edaebe0
00000000-0000-0000-0000-000000000000	6	klprw7wke45f	132f5f5b-74b2-456a-9f86-976df91c3809	t	2026-09-12 12:14:21.50399+00	2026-09-12 13:12:21.847233+00	7a6ikssq4hmy	9b56ac4d-62ca-43cf-b092-e9a06edaebe0
00000000-0000-0000-0000-000000000000	7	iie6wakrtn5q	132f5f5b-74b2-456a-9f86-976df91c3809	t	2026-09-12 13:12:21.864147+00	2026-09-12 14:20:06.941805+00	klprw7wke45f	9b56ac4d-62ca-43cf-b092-e9a06edaebe0
00000000-0000-0000-0000-000000000000	8	bdjym4u7bjch	132f5f5b-74b2-456a-9f86-976df91c3809	t	2026-09-12 14:20:06.955183+00	2026-09-12 15:52:42.961249+00	iie6wakrtn5q	9b56ac4d-62ca-43cf-b092-e9a06edaebe0
00000000-0000-0000-0000-000000000000	9	yympyfolusyp	132f5f5b-74b2-456a-9f86-976df91c3809	t	2026-09-12 15:52:42.976982+00	2026-09-12 16:51:09.344603+00	bdjym4u7bjch	9b56ac4d-62ca-43cf-b092-e9a06edaebe0
00000000-0000-0000-0000-000000000000	10	bgrh4fhwl6x6	132f5f5b-74b2-456a-9f86-976df91c3809	t	2026-09-12 16:51:09.352302+00	2026-09-12 17:49:11.35124+00	yympyfolusyp	9b56ac4d-62ca-43cf-b092-e9a06edaebe0
00000000-0000-0000-0000-000000000000	11	5655a6nb2smq	132f5f5b-74b2-456a-9f86-976df91c3809	t	2026-09-12 17:49:11.360959+00	2026-09-13 07:36:37.427159+00	bgrh4fhwl6x6	9b56ac4d-62ca-43cf-b092-e9a06edaebe0
00000000-0000-0000-0000-000000000000	12	c4a2swwjyggz	132f5f5b-74b2-456a-9f86-976df91c3809	t	2026-09-13 07:36:37.441401+00	2026-09-13 08:51:26.254234+00	5655a6nb2smq	9b56ac4d-62ca-43cf-b092-e9a06edaebe0
00000000-0000-0000-0000-000000000000	13	56kur2akmaoh	132f5f5b-74b2-456a-9f86-976df91c3809	t	2026-09-13 08:51:26.267105+00	2026-09-13 09:59:32.046653+00	c4a2swwjyggz	9b56ac4d-62ca-43cf-b092-e9a06edaebe0
00000000-0000-0000-0000-000000000000	14	b5ybiqtbny7y	132f5f5b-74b2-456a-9f86-976df91c3809	f	2026-09-13 09:59:32.064262+00	2026-09-13 09:59:32.064262+00	56kur2akmaoh	9b56ac4d-62ca-43cf-b092-e9a06edaebe0
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."sso_providers" ("id", "resource_id", "created_at", "updated_at", "disabled") FROM stdin;
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."saml_providers" ("id", "sso_provider_id", "entity_id", "metadata_xml", "metadata_url", "attribute_mapping", "created_at", "updated_at", "name_id_format") FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."saml_relay_states" ("id", "sso_provider_id", "request_id", "for_email", "redirect_to", "created_at", "updated_at", "flow_state_id") FROM stdin;
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."sso_domains" ("id", "sso_provider_id", "domain", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."webauthn_challenges" ("id", "user_id", "challenge_type", "session_data", "created_at", "expires_at") FROM stdin;
\.


--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."webauthn_credentials" ("id", "user_id", "credential_id", "public_key", "attestation_type", "aaguid", "sign_count", "transports", "backup_eligible", "backed_up", "friendly_name", "created_at", "updated_at", "last_used_at") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."users" ("id", "email", "full_name", "phone", "is_admin", "is_active", "created_at", "updated_at") FROM stdin;
132f5f5b-74b2-456a-9f86-976df91c3809	kartikgupta1805@gmail.com		\N	t	t	2026-09-12 11:16:03.434829+00	2026-09-12 11:16:03.434829+00
\.


--
-- Data for Name: addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."addresses" ("id", "user_id", "label", "full_name", "phone", "line1", "line2", "city", "state", "pincode", "is_default", "created_at") FROM stdin;
1	132f5f5b-74b2-456a-9f86-976df91c3809	Home	Kartik	9484634082	140/B Radha Krishna Soc.	Near akota garden	Vadodara	Gujarat	390020	t	2026-09-13 09:29:39.445596+00
\.


--
-- Data for Name: brands; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."brands" ("id", "name", "slug", "logo", "description", "is_active", "created_at", "updated_at") FROM stdin;
1	BumChums	bumchums	https://mioaooryvahjrmcxnrgy.supabase.co/storage/v1/object/public/brand-logos/1789214724231-images.jpg	Leisurewear, activewear and Hoseiry	t	2026-09-12 12:06:04.293843+00	2026-09-12 12:06:04.293843+00
2	VIP	vip	https://mioaooryvahjrmcxnrgy.supabase.co/storage/v1/object/public/brand-logos/1789214830374-download-(1).png	Innerwear and Hoseiry Clothing	t	2026-09-12 12:07:10.451787+00	2026-09-12 12:07:10.451787+00
3	Frenchie	frenchie	https://mioaooryvahjrmcxnrgy.supabase.co/storage/v1/object/public/brand-logos/1789235231200-Frenchie.webp	Hosiery Brief and long bottoms	t	2026-09-12 17:47:14.857171+00	2026-09-12 17:47:14.857171+00
\.


--
-- Data for Name: carousels; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."carousels" ("id", "title", "image_url", "brand_id", "sort_order", "is_active", "created_at", "updated_at") FROM stdin;
1	VIP Frenchie	https://vip.in/cdn/shop/files/Frenchie_a15cb961-d59b-4c01-8476-822ab1f8b359.jpg?v=1789027239&width=2200	2	1	t	2026-09-12 16:32:09.788693+00	2026-09-12 16:32:09.788693+00
2	Bumchum T-shirts	https://mioaooryvahjrmcxnrgy.supabase.co/storage/v1/object/public/carousel-images/1789230969473-Bumchums-Crew-Neck-t-Shirt-comfort.webp	1	2	t	2026-09-12 16:36:09.987929+00	2026-09-12 16:36:27.843+00
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."categories" ("id", "name", "slug", "description", "is_active", "created_at", "updated_at", "image") FROM stdin;
1	Menswear	menswear	Mens clothing	t	2026-09-12 12:10:03.427337+00	2026-09-12 12:19:27.375+00	https://mioaooryvahjrmcxnrgy.supabase.co/storage/v1/object/public/product-images/categories/1789215567007-91d94b79-2002-484b-b141-09b7b629a616-Menswear.webp
2	Womenswear	womenswear	Innerwears and Hosiery	t	2026-09-12 13:29:35.735916+00	2026-09-12 13:29:35.735916+00	https://mioaooryvahjrmcxnrgy.supabase.co/storage/v1/object/public/product-images/categories/1789219775367-456a708b-f377-4f7c-9134-dfe94d46f976-Women.jpg
3	Kidswear	kidswear	Innerwear, Coordsets and much more	t	2026-09-12 13:30:30.274614+00	2026-09-12 13:30:30.274614+00	https://mioaooryvahjrmcxnrgy.supabase.co/storage/v1/object/public/product-images/categories/1789219829765-f2b65b5d-4788-4f9f-b034-3931d18a9e0b-Kidswear.jpg
4	Atheletix	atheletix	Sports T-shirts, tracks and shorts	t	2026-09-12 13:31:23.305989+00	2026-09-12 13:31:23.305989+00	https://mioaooryvahjrmcxnrgy.supabase.co/storage/v1/object/public/product-images/categories/1789219882723-a353c83d-1ed3-4e73-b9c6-256bbfcaee8d-Athletix.webp
\.


--
-- Data for Name: colors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."colors" ("id", "name", "hex_code") FROM stdin;
1	Black	#000000
2	White	#FFFFFF
3	Navy Blue	#000080
4	Royal Blue	#4169E1
5	Sky Blue	#87CEEB
6	Red	#FF0000
7	Maroon	#800000
8	Pink	#FFC0CB
9	Peach	#FFDAB9
10	Yellow	#FFD700
11	Mustard	#FFDB58
12	Orange	#FFA500
13	Green	#008000
14	Olive Green	#808000
15	Mint Green	#98FF98
16	Bottle Green	#006A4E
17	Purple	#800080
18	Lavender	#E6E6FA
19	Grey	#808080
20	Beige	#F5F5DC
21	Cinnamon	#D2691E
22	Onion Blue	#6B7A8F
\.


--
-- Data for Name: subcategories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."subcategories" ("id", "category_id", "name", "slug", "description", "is_active", "created_at", "updated_at", "image") FROM stdin;
1	1	T-shirts	t-shirts	\N	t	2026-09-12 13:48:19.235188+00	2026-09-12 13:48:19.235188+00	https://mioaooryvahjrmcxnrgy.supabase.co/storage/v1/object/public/product-images/subcategories/1789220898431-6230dfa7-700b-4c64-9920-0e15b14a85a1-menstshirt.webp
2	1	Track	track	\N	t	2026-09-12 14:22:51.966762+00	2026-09-12 14:22:51.966762+00	https://mioaooryvahjrmcxnrgy.supabase.co/storage/v1/object/public/product-images/subcategories/1789222876422-c6438b80-fd89-4375-9de7-17aea5bd93ee-menstrack.jpg
3	1	Underwear	underwear	\N	t	2026-09-12 14:42:06.370145+00	2026-09-12 14:42:06.370145+00	https://mioaooryvahjrmcxnrgy.supabase.co/storage/v1/object/public/product-images/subcategories/1789224124659-97598594-307b-48a4-8796-5fe66894af69-VP-MI-TR-MAXER-2X5_3.webp
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."products" ("id", "category_id", "subcategory_id", "brand_id", "name", "gender", "slug", "model_no", "description", "sku", "is_active", "created_at", "updated_at") FROM stdin;
1	1	3	2	Ultima Solid Cotton Trunks for Men - Assorted Colours	Men	ultima-solid-cotton-trunks-for-men---assorted-colours	VP-MI-TR-ULTMC-10P	Introducing the VIP Ultima Trunks, made with 100% Combed Cotton fabric for ultimate softness and stretch-ability for an active lifestyle. Featuring a mid-rise fit and a soft outer elasticized waistband that leaves no marks, these trunks offer better durability and comfort. Upgrade your underwear game today!	AE-001	t	2026-09-12 16:56:49.271798+00	2026-09-12 16:56:49.271798+00
2	1	3	2	Unique   Men's   Snug   Fit   100%   Cotton   Trunks   -   Assorted   Colours	Men	unique-mens-snug-fit-100-cotton-trunks---assorted-colours	VP-MI-TR-UNICL-10P	Discover the ultimate comfort with our VIP Unique Trunks. Made with 100% combed cotton jersey fabric, these trunks feel incredibly soft on your skin. The stretchable mid rise design and contoured double pouch provide a snug fit for better durability. Plus, the tag-free and soft concealed waistband ensures no marks, making them perfect for everyday wear.	AE-002	t	2026-09-12 17:32:57.877507+00	2026-09-12 17:32:57.877507+00
3	1	3	3	Plus   Color   Men   100%   Combed   Cotton   Brief   -   Assorted   Color	Men	plus-color-men-100-combed-cotton-brief---assorted-color	FR-MI-BF-PLUSC-10P	Experience the difference of 100% combed cotton, smoother than regular cotton, for exceptional comfort against your skin.\nStay fresh and dry with superior absorbency and breathable cotton fabric.\nSay goodbye to pinching! The concealed waistband ensures a smooth, comfortable fit throughout the day.\nContoured leg openings and full back coverage provide extra comfort without restricting movement.\nThe FRENCHIE Plus Men's Brief is the perfect choice for all-day wear, keeping you feeling comfortable and confident, no matter the activity..	AE-003	t	2026-09-12 17:52:01.932528+00	2026-09-12 17:52:01.932528+00
4	1	1	2	Men's   Solid   White   004   Leisurewear   Essential   Cotton   Tee	Men	mens-solid-white-004-leisurewear-essential-cotton-tee	\N	Made from 100% cotton jersey, soft and comfortable, keeps you cool.\nRibbed round neck, standard fit, and half sleeves for a casual wear.\nTextured logo in hem line adds a stylish touch.\nPair with jeans and shoes to complete the look.\nStay cool and dry in this Rivolta Men's wardrobe essential.	AE-003	t	2026-09-12 18:09:13.167477+00	2026-09-13 09:00:38.538+00
\.


--
-- Data for Name: product_colors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."product_colors" ("id", "product_id", "color_id", "is_active") FROM stdin;
1	4	2	t
5	4	6	t
2	4	14	f
3	4	5	f
4	4	22	f
\.


--
-- Data for Name: sizes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."sizes" ("id", "name", "sort_order") FROM stdin;
1	XS (75 cm / 30 inch)	1
2	S (80 cm / 32 inch)	2
3	M (85 cm / 34 inch)	3
4	L (90 cm / 36 inch)	4
5	XL (95 cm / 38 inch)	5
6	2XL (100 cm / 40 inch)	6
7	3XL (105 cm / 42 inch)	7
8	4XL (110 cm / 44 inch)	8
\.


--
-- Data for Name: product_sizes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."product_sizes" ("id", "product_id", "size_id", "price", "mrp", "sku", "is_active") FROM stdin;
1	1	2	165.00	165.00	\N	t
2	1	3	165.00	165.00	\N	t
3	1	4	165.00	165.00	\N	t
4	1	5	191.00	191.00	\N	t
5	2	2	160.00	160.00	\N	t
6	2	3	160.00	160.00	\N	t
7	2	4	150.00	150.00	\N	t
8	2	5	166.00	166.00	\N	t
9	2	6	166.00	166.00	\N	t
10	2	8	189.00	189.00	\N	t
11	3	2	122.00	122.00	\N	t
12	3	3	135.00	135.00	\N	t
13	3	4	135.00	135.00	\N	t
14	3	5	135.00	135.00	\N	t
15	3	6	135.00	135.00	\N	t
16	3	8	135.00	135.00	\N	t
17	4	3	399.00	399.00	\N	t
18	4	4	399.00	399.00	\N	t
19	4	5	399.00	399.00	\N	t
20	4	6	399.00	399.00	\N	t
\.


--
-- Data for Name: cart; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."cart" ("id", "user_id", "product_id", "product_size_id", "product_color_id", "quantity", "created_at") FROM stdin;
\.


--
-- Data for Name: coupons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."coupons" ("id", "code", "discount_type", "discount_value", "min_order_amount", "max_discount_amount", "usage_limit", "used_count", "is_active", "expires_at", "created_at") FROM stdin;
\.


--
-- Data for Name: inventory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."inventory" ("id", "product_id", "product_size_id", "product_color_id", "quantity", "reserved_quantity", "reorder_level", "warehouse_location", "created_at", "updated_at") FROM stdin;
4	1	4	\N	5	0	2	\N	2026-09-12 16:56:52.448414+00	2026-09-12 17:00:02.447+00
1	1	2	\N	5	0	2	\N	2026-09-12 16:56:52.445494+00	2026-09-12 17:00:05.148+00
3	1	3	\N	5	0	2	\N	2026-09-12 16:56:52.448937+00	2026-09-12 17:00:13.888+00
7	2	5	\N	5	0	2	\N	2026-09-12 17:33:02.722772+00	2026-09-12 17:35:34.053+00
10	2	10	\N	5	0	2	\N	2026-09-12 17:33:02.729844+00	2026-09-12 17:35:36.446+00
9	2	8	\N	5	0	2	\N	2026-09-12 17:33:02.728159+00	2026-09-12 17:35:38.46+00
8	2	9	\N	5	0	2	\N	2026-09-12 17:33:02.727167+00	2026-09-12 17:35:40.113+00
6	2	7	\N	5	0	2	\N	2026-09-12 17:33:02.723107+00	2026-09-12 17:35:42.407+00
5	2	6	\N	5	0	2	\N	2026-09-12 17:33:02.722613+00	2026-09-12 17:35:46.767+00
11	3	12	\N	5	0	0	\N	2026-09-12 17:52:25.280958+00	2026-09-12 18:00:57.404+00
12	3	11	\N	5	0	0	\N	2026-09-12 17:52:25.282276+00	2026-09-12 18:01:00.045+00
13	3	13	\N	5	0	0	\N	2026-09-12 17:52:25.28307+00	2026-09-12 18:01:01.481+00
14	3	14	\N	5	0	0	\N	2026-09-12 17:52:25.287067+00	2026-09-12 18:01:02.92+00
15	3	15	\N	5	0	0	\N	2026-09-12 17:52:25.288128+00	2026-09-12 18:01:06.839+00
16	3	16	\N	5	0	0	\N	2026-09-12 17:52:25.30097+00	2026-09-12 18:01:09.357+00
21	4	17	1	0	0	10	\N	2026-09-13 07:38:14.117583+00	2026-09-13 07:38:14.117583+00
25	4	18	1	0	0	10	\N	2026-09-13 07:38:14.117583+00	2026-09-13 07:38:14.117583+00
29	4	19	1	0	0	10	\N	2026-09-13 07:38:14.117583+00	2026-09-13 07:38:14.117583+00
33	4	20	1	0	0	10	\N	2026-09-13 07:38:14.117583+00	2026-09-13 07:38:14.117583+00
37	4	17	5	5	0	10	\N	2026-09-13 08:03:54.305072+00	2026-09-13 08:03:54.305072+00
38	4	18	5	5	0	10	\N	2026-09-13 08:03:54.305072+00	2026-09-13 08:03:54.305072+00
39	4	19	5	5	0	10	\N	2026-09-13 08:03:54.305072+00	2026-09-13 08:03:54.305072+00
40	4	20	5	5	0	10	\N	2026-09-13 08:03:54.305072+00	2026-09-13 08:03:54.305072+00
2	1	1	\N	4	0	2	\N	2026-09-12 16:56:52.44485+00	2026-09-13 09:30:42.411354+00
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."notifications" ("id", "user_id", "type", "title", "message", "entity_type", "entity_id", "is_read", "created_at", "read_at") FROM stdin;
63125edc-cc71-4ff1-900f-944bbb98e8ea	132f5f5b-74b2-456a-9f86-976df91c3809	order_created	Order placed successfully	Your order #1 has been placed successfully.	order	1	t	2026-09-13 09:30:42.711642+00	2026-09-13 09:31:29.41+00
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."orders" ("id", "user_id", "address_id", "coupon_id", "status", "payment_status", "payment_method", "payment_id", "subtotal", "discount_amount", "delivery_charge", "total_amount", "notes", "created_at", "updated_at") FROM stdin;
1	132f5f5b-74b2-456a-9f86-976df91c3809	1	\N	processing	paid	razorpay	pay_TbTL0x1v9a3vZb	165.00	0.00	99.00	264.00	\N	2026-09-13 09:30:41.800595+00	2026-09-13 09:30:41.800595+00
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."order_items" ("id", "order_id", "product_id", "product_size_id", "product_color_id", "quantity", "unit_price", "total_price") FROM stdin;
1	1	1	1	\N	1	165.00	165.00
\.


--
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."product_images" ("id", "product_id", "color_id", "image_url", "is_primary", "sort_order", "is_active") FROM stdin;
1	1	\N	https://mioaooryvahjrmcxnrgy.supabase.co/storage/v1/object/public/product-images/1/1789232212690-ULTIMA6595.webp	f	0	t
2	1	\N	https://mioaooryvahjrmcxnrgy.supabase.co/storage/v1/object/public/product-images/1/1789232213867-ULTIMA6590.webp	f	1	t
3	1	\N	https://mioaooryvahjrmcxnrgy.supabase.co/storage/v1/object/public/product-images/1/1789232215208-ULTIMA6578.webp	f	2	t
4	1	\N	https://mioaooryvahjrmcxnrgy.supabase.co/storage/v1/object/public/product-images/1/1789232215926-ULTIMA6589.jpg	f	3	t
5	1	\N	https://mioaooryvahjrmcxnrgy.supabase.co/storage/v1/object/public/product-images/1/1789232216741-ULTIMA6588.webp	f	4	t
6	1	\N	https://mioaooryvahjrmcxnrgy.supabase.co/storage/v1/object/public/product-images/1/1789232217412-ULTIMA6582.webp	t	5	t
7	1	\N	https://mioaooryvahjrmcxnrgy.supabase.co/storage/v1/object/public/product-images/1/1789232218356-51HmAs_VvvL._SX679_cedf5e68-2939-4483-994b-d141063c8ce9.webp	f	6	t
8	2	\N	https://mioaooryvahjrmcxnrgy.supabase.co/storage/v1/object/public/product-images/2/1789234383016-VP-MI-TR-UNICL-10P-PO4_8.webp	f	0	t
9	2	\N	https://mioaooryvahjrmcxnrgy.supabase.co/storage/v1/object/public/product-images/2/1789234384070-VP-MI-TR-UNICL-10P-PO3_5.webp	t	1	t
10	2	\N	https://mioaooryvahjrmcxnrgy.supabase.co/storage/v1/object/public/product-images/2/1789234385067-VP-MI-TR-UNICL-10P-PO3_4.webp	f	2	t
11	2	\N	https://mioaooryvahjrmcxnrgy.supabase.co/storage/v1/object/public/product-images/2/1789234386251-VP-MI-TR-UNICL-10P-PO3_8.webp	f	3	t
12	2	\N	https://mioaooryvahjrmcxnrgy.supabase.co/storage/v1/object/public/product-images/2/1789234386880-VP-MI-TR-UNICL-10P-PO3_3.webp	f	4	t
13	2	\N	https://mioaooryvahjrmcxnrgy.supabase.co/storage/v1/object/public/product-images/2/1789234387359-VP-MI-TR-UNICL-10P-PO3_6.webp	f	5	t
14	2	\N	https://mioaooryvahjrmcxnrgy.supabase.co/storage/v1/object/public/product-images/2/1789234387873-VP-MI-TR-UNICL-10P-PO3_2.webp	f	6	t
15	2	\N	https://mioaooryvahjrmcxnrgy.supabase.co/storage/v1/object/public/product-images/2/1789234388334-VP-MI-TR-UNICL-10P-PO3_7.webp	f	7	t
16	3	\N	https://mioaooryvahjrmcxnrgy.supabase.co/storage/v1/object/public/product-images/3/1789235545648-BRIEFFRENCHIEPLUSBLACKM_7.webp	f	0	t
17	3	\N	https://mioaooryvahjrmcxnrgy.supabase.co/storage/v1/object/public/product-images/3/1789235552367-BRIEFFRENCHIEPLUSFORESTGREENM_1.webp	f	1	t
18	3	\N	https://mioaooryvahjrmcxnrgy.supabase.co/storage/v1/object/public/product-images/3/1789235553555-Plus_1_40.webp	f	2	t
19	3	\N	https://mioaooryvahjrmcxnrgy.supabase.co/storage/v1/object/public/product-images/3/1789235555190-Plus_1_3.webp	f	3	t
20	3	\N	https://mioaooryvahjrmcxnrgy.supabase.co/storage/v1/object/public/product-images/3/1789235556377-BRIEFFRENCHIEPLUSNAVYBLUEM_5.webp	f	4	t
21	3	\N	https://mioaooryvahjrmcxnrgy.supabase.co/storage/v1/object/public/product-images/3/1789235557854-Plus_1_45.webp	f	5	t
22	3	\N	https://mioaooryvahjrmcxnrgy.supabase.co/storage/v1/object/public/product-images/3/1789235558609-BRIEFFRENCHIEPLUSNAVYBLUEM_2.webp	f	6	t
23	3	\N	https://mioaooryvahjrmcxnrgy.supabase.co/storage/v1/object/public/product-images/3/1789235559480-BRIEFFRENCHIEPLUSBLACKM_4.webp	f	7	t
24	3	\N	https://mioaooryvahjrmcxnrgy.supabase.co/storage/v1/object/public/product-images/3/1789235560367-BRIEFFRENCHIEPLUSFORESTGREENM_3.webp	f	8	t
25	3	\N	https://mioaooryvahjrmcxnrgy.supabase.co/storage/v1/object/public/product-images/3/1789235561492-BRIEFFRENCHIEPLUSBLACKM_1.webp	t	9	t
32	4	6	https://mioaooryvahjrmcxnrgy.supabase.co/storage/v1/object/public/product-images/4/1789286634599-VIP7842.webp	t	6	t
26	4	\N	https://mioaooryvahjrmcxnrgy.supabase.co/storage/v1/object/public/product-images/4/1789236556338-VIP7546.webp	f	0	t
27	4	\N	https://mioaooryvahjrmcxnrgy.supabase.co/storage/v1/object/public/product-images/4/1789236557620-VIP7559.webp	f	1	t
28	4	\N	https://mioaooryvahjrmcxnrgy.supabase.co/storage/v1/object/public/product-images/4/1789236558243-VIP7564.webp	f	2	t
29	4	\N	https://mioaooryvahjrmcxnrgy.supabase.co/storage/v1/object/public/product-images/4/1789236558815-VIP7551.webp	f	3	t
30	4	\N	https://mioaooryvahjrmcxnrgy.supabase.co/storage/v1/object/public/product-images/4/1789236560627-VIP7544.webp	f	4	t
31	4	\N	https://mioaooryvahjrmcxnrgy.supabase.co/storage/v1/object/public/product-images/4/1789236561203-VIP7569.webp	f	5	t
33	4	6	https://mioaooryvahjrmcxnrgy.supabase.co/storage/v1/object/public/product-images/4/1789286637781-VIP7818.webp	f	7	t
34	4	6	https://mioaooryvahjrmcxnrgy.supabase.co/storage/v1/object/public/product-images/4/1789286638369-VIP7830.webp	f	8	t
35	4	6	https://mioaooryvahjrmcxnrgy.supabase.co/storage/v1/object/public/product-images/4/1789286639041-VIP7827.webp	f	9	t
36	4	6	https://mioaooryvahjrmcxnrgy.supabase.co/storage/v1/object/public/product-images/4/1789286639819-VIP7834.webp	f	10	t
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."reviews" ("id", "user_id", "product_id", "order_item_id", "rating", "title", "body", "is_approved", "created_at") FROM stdin;
\.


--
-- Data for Name: videos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."videos" ("id", "slot", "video_url", "source_type", "is_active", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: wishlist; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."wishlist" ("id", "user_id", "product_id", "created_at") FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type", "versioning_status") FROM stdin;
product-images	product-images	\N	2026-09-12 11:34:59.405632+00	2026-09-12 11:34:59.405632+00	t	f	\N	\N	\N	STANDARD	DISABLED
brand-logos	brand-logos	\N	2026-09-12 11:34:59.405632+00	2026-09-12 11:34:59.405632+00	t	f	\N	\N	\N	STANDARD	DISABLED
storefront-videos	storefront-videos	\N	2026-09-12 11:34:59.405632+00	2026-09-12 11:34:59.405632+00	t	f	\N	\N	\N	STANDARD	DISABLED
carousel-images	carousel-images	\N	2026-09-12 11:34:59.405632+00	2026-09-12 11:34:59.405632+00	t	f	\N	\N	\N	STANDARD	DISABLED
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."buckets_analytics" ("name", "type", "format", "created_at", "updated_at", "id", "deleted_at") FROM stdin;
\.


--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."buckets_vectors" ("id", "type", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."objects" ("id", "bucket_id", "name", "owner", "created_at", "updated_at", "last_accessed_at", "metadata", "version", "owner_id", "user_metadata", "archived_at", "is_delete_marker", "is_versioned") FROM stdin;
fcadf775-8d3c-45ee-8eaf-8c3ab8244992	brand-logos	1789214724231-images.jpg	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-12 12:06:03.914913+00	2026-09-12 12:06:03.914913+00	2026-09-12 12:06:03.914913+00	{"eTag": "\\"0919cb48cba8566c2dc73f9f4ba514e1\\"", "size": 13204, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T12:06:04.000Z", "contentLength": 13204, "httpStatusCode": 200}	3e6a9b38-280e-490e-9dc8-4c5b4e6d43c9	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
bc75b53d-f02e-4e2d-8fce-a7e1baa15caa	brand-logos	1789214830374-download-(1).png	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-12 12:07:10.140881+00	2026-09-12 12:07:10.140881+00	2026-09-12 12:07:10.140881+00	{"eTag": "\\"863860bd07f59c2c1571c5e3db88fad6\\"", "size": 2549, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T12:07:11.000Z", "contentLength": 2549, "httpStatusCode": 200}	3905d90b-2f99-4151-9237-c6d7c02a0ce1	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
71fa811f-966e-477b-b25c-78f358cc713e	product-images	categories/1789215001254-cb298028-81b8-445a-87fb-10d9cda3d393-VP-MI-TR-MAXER-2X5_4.webp	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-12 12:10:02.451572+00	2026-09-12 12:10:02.451572+00	2026-09-12 12:10:02.451572+00	{"eTag": "\\"3d8331984b3cea4b39ebc3e6033fd167\\"", "size": 171658, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T12:10:03.000Z", "contentLength": 171658, "httpStatusCode": 200}	784903d2-dd9e-4ef0-9eff-3abd1618be35	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
d52dc304-b64c-4c93-a6f9-84bacecedb80	product-images	categories/1789215567007-91d94b79-2002-484b-b141-09b7b629a616-Menswear.webp	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-12 12:19:26.855063+00	2026-09-12 12:19:26.855063+00	2026-09-12 12:19:26.855063+00	{"eTag": "\\"89ad469530283be3f949edf1e7b67ab4\\"", "size": 34646, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T12:19:27.000Z", "contentLength": 34646, "httpStatusCode": 200}	da6fdef9-74e5-4646-a3c1-c314e14da04e	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
eafe8dae-9a4a-4d35-9f25-0287d0283e2a	product-images	categories/1789219775367-456a708b-f377-4f7c-9134-dfe94d46f976-Women.jpg	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-12 13:29:35.253815+00	2026-09-12 13:29:35.253815+00	2026-09-12 13:29:35.253815+00	{"eTag": "\\"00d3a860450ceb1e1129bbd2ea3d3342\\"", "size": 10785, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T13:29:36.000Z", "contentLength": 10785, "httpStatusCode": 200}	91ab30f2-8c38-4ad4-82c9-3096f857369b	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
07a607c7-f189-42f8-ba04-01764e772eb1	product-images	categories/1789219829765-f2b65b5d-4788-4f9f-b034-3931d18a9e0b-Kidswear.jpg	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-12 13:30:29.996572+00	2026-09-12 13:30:29.996572+00	2026-09-12 13:30:29.996572+00	{"eTag": "\\"5a0001a15c393ce6b7a91c7de25fa799\\"", "size": 21887, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T13:30:30.000Z", "contentLength": 21887, "httpStatusCode": 200}	b7716b35-9dc5-4ac3-aed3-ec3c9a6feeb4	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
b4c06acd-f1b1-4f11-8358-07fcba66b1c4	product-images	categories/1789219882723-a353c83d-1ed3-4e73-b9c6-256bbfcaee8d-Athletix.webp	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-12 13:31:22.709383+00	2026-09-12 13:31:22.709383+00	2026-09-12 13:31:22.709383+00	{"eTag": "\\"7dc3e484d013da2a5b0aeaa7a81137da\\"", "size": 47928, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T13:31:23.000Z", "contentLength": 47928, "httpStatusCode": 200}	09e127ea-5011-4194-a50a-2e945a888a35	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
fd918dde-4874-4f70-af1a-e0cdc8e836e8	product-images	subcategories/1789220898431-6230dfa7-700b-4c64-9920-0e15b14a85a1-menstshirt.webp	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-12 13:48:18.80914+00	2026-09-12 13:48:18.80914+00	2026-09-12 13:48:18.80914+00	{"eTag": "\\"f36e513a7f6b83b4f42848af8010a56f\\"", "size": 120560, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T13:48:19.000Z", "contentLength": 120560, "httpStatusCode": 200}	ff81fbd7-2738-490c-a07f-731830b33a5e	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
48eabc45-5bee-482d-9602-a89050f9464b	product-images	subcategories/1789222876422-c6438b80-fd89-4375-9de7-17aea5bd93ee-menstrack.jpg	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-12 14:22:51.337461+00	2026-09-12 14:22:51.337461+00	2026-09-12 14:22:51.337461+00	{"eTag": "\\"087711e6c9f3a942f092d8f6a4c24b34\\"", "size": 12686, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T14:22:52.000Z", "contentLength": 12686, "httpStatusCode": 200}	f3ed1778-3916-4bed-8549-10f8a96a70f7	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
5c5b3902-85aa-4292-b1cb-d0c0a5d88a0a	product-images	subcategories/1789224124659-97598594-307b-48a4-8796-5fe66894af69-VP-MI-TR-MAXER-2X5_3.webp	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-12 14:42:05.906083+00	2026-09-12 14:42:05.906083+00	2026-09-12 14:42:05.906083+00	{"eTag": "\\"b1b80e2ce9630b224f1e818b085a0325\\"", "size": 155768, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T14:42:06.000Z", "contentLength": 155768, "httpStatusCode": 200}	9f027555-c982-4258-b38c-d15da9e103a3	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
b08644d5-a17b-4d10-81ba-0f256ac09a3a	carousel-images	1789230969473-Bumchums-Crew-Neck-t-Shirt-comfort.webp	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-12 16:36:09.770255+00	2026-09-12 16:36:09.770255+00	2026-09-12 16:36:09.770255+00	{"eTag": "\\"dfea4b9d81eac422b2c560ec3e91d95f\\"", "size": 36384, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T16:36:10.000Z", "contentLength": 36384, "httpStatusCode": 200}	55663616-6e0f-4f7a-9d33-bd9db3099bc4	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
e595f6cb-eec5-46d8-9f2e-103277741024	product-images	1/1789232212690-ULTIMA6595.webp	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-12 16:56:53.194634+00	2026-09-12 16:56:53.194634+00	2026-09-12 16:56:53.194634+00	{"eTag": "\\"988e0197496000b56889479eb35b8431\\"", "size": 70478, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T16:56:54.000Z", "contentLength": 70478, "httpStatusCode": 200}	a08c01ff-43ac-46ef-984d-2a12419d3b4c	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
63fb11d4-4221-4d04-bd90-8a0982e215dd	product-images	1/1789232213867-ULTIMA6590.webp	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-12 16:56:54.491753+00	2026-09-12 16:56:54.491753+00	2026-09-12 16:56:54.491753+00	{"eTag": "\\"edce2f1702728acaa482326195947e8b\\"", "size": 98198, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T16:56:55.000Z", "contentLength": 98198, "httpStatusCode": 200}	8c858ced-8d60-4c51-bd7a-034f2c7a10e0	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
6580c610-9bcd-46f5-a0d0-3596f1c9c652	product-images	1/1789232215208-ULTIMA6578.webp	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-12 16:56:55.452313+00	2026-09-12 16:56:55.452313+00	2026-09-12 16:56:55.452313+00	{"eTag": "\\"2b9f3ae54666ece83c6a3bc41431f71e\\"", "size": 94416, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T16:56:56.000Z", "contentLength": 94416, "httpStatusCode": 200}	8e290f58-8cec-4854-932e-9106efa38846	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
8812bdb3-da9c-4558-a397-e6ea21d0d2eb	product-images	1/1789232215926-ULTIMA6589.jpg	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-12 16:56:56.281698+00	2026-09-12 16:56:56.281698+00	2026-09-12 16:56:56.281698+00	{"eTag": "\\"03a6cbdb0ada9abff5e4c05f4b4743dd\\"", "size": 144624, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T16:56:57.000Z", "contentLength": 144624, "httpStatusCode": 200}	23457ffa-9236-427d-9aec-f223304c0c3f	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
9aa2c8d1-e61f-4cf2-bad3-fbc803e1a49f	product-images	1/1789232216741-ULTIMA6588.webp	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-12 16:56:56.984155+00	2026-09-12 16:56:56.984155+00	2026-09-12 16:56:56.984155+00	{"eTag": "\\"ae7aeeae568c9de1ddc5dd043990b8e9\\"", "size": 81370, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T16:56:57.000Z", "contentLength": 81370, "httpStatusCode": 200}	8a0e4e3f-584c-4475-aefb-2a9849e39e05	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
9f6faeac-70f2-4a9a-954c-b0b4dd40fba5	product-images	1/1789232217412-ULTIMA6582.webp	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-12 16:56:57.763958+00	2026-09-12 16:56:57.763958+00	2026-09-12 16:56:57.763958+00	{"eTag": "\\"2febdebb024e45d38284ead458d483d8\\"", "size": 77516, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T16:56:58.000Z", "contentLength": 77516, "httpStatusCode": 200}	422a927f-98f0-4280-a71c-8f3d09851809	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
81f80152-d55e-4163-9270-cafa61ea5cdd	product-images	1/1789232218356-51HmAs_VvvL._SX679_cedf5e68-2939-4483-994b-d141063c8ce9.webp	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-12 16:56:58.520505+00	2026-09-12 16:56:58.520505+00	2026-09-12 16:56:58.520505+00	{"eTag": "\\"fe80a17c0eaaec969b51cfb20af3d893\\"", "size": 32466, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T16:56:59.000Z", "contentLength": 32466, "httpStatusCode": 200}	f160c888-e06a-437a-9938-06fded242b07	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
6c7995fb-094c-4506-9323-aa45f54092d9	product-images	2/1789234383016-VP-MI-TR-UNICL-10P-PO4_8.webp	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-12 17:33:03.357213+00	2026-09-12 17:33:03.357213+00	2026-09-12 17:33:03.357213+00	{"eTag": "\\"1540b4524bf299ac03c378838cc7ac12\\"", "size": 69578, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T17:33:04.000Z", "contentLength": 69578, "httpStatusCode": 200}	331fa9d4-05f1-49cc-a81a-23f532628ef5	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
5a2d68f9-1b24-4d1b-b764-ad0c9cac7668	product-images	2/1789234384070-VP-MI-TR-UNICL-10P-PO3_5.webp	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-12 17:33:04.407326+00	2026-09-12 17:33:04.407326+00	2026-09-12 17:33:04.407326+00	{"eTag": "\\"08063ae0dc155beee55f45a7de675102\\"", "size": 54518, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T17:33:05.000Z", "contentLength": 54518, "httpStatusCode": 200}	be4a58f1-4b28-4764-a590-5e1635a3b640	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
9b7ada62-7628-48ad-b7f8-2120417bcffc	product-images	2/1789234385067-VP-MI-TR-UNICL-10P-PO3_4.webp	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-12 17:33:05.820901+00	2026-09-12 17:33:05.820901+00	2026-09-12 17:33:05.820901+00	{"eTag": "\\"0ea460df89af0333b6665427cd25708b\\"", "size": 134864, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T17:33:06.000Z", "contentLength": 134864, "httpStatusCode": 200}	b5ac1bfe-c858-484c-9b83-1084bfd29863	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
c978b915-b890-4e68-a536-b2548e1eb6b5	product-images	2/1789234386251-VP-MI-TR-UNICL-10P-PO3_8.webp	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-12 17:33:06.436671+00	2026-09-12 17:33:06.436671+00	2026-09-12 17:33:06.436671+00	{"eTag": "\\"c529acda642f29c4b0d8f9a39a5971a9\\"", "size": 63602, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T17:33:07.000Z", "contentLength": 63602, "httpStatusCode": 200}	88058343-39d3-4225-81d0-3cccebc2b725	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
04ce43bb-db30-40e7-81a8-6890517b1f54	product-images	2/1789234386880-VP-MI-TR-UNICL-10P-PO3_3.webp	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-12 17:33:06.94036+00	2026-09-12 17:33:06.94036+00	2026-09-12 17:33:06.94036+00	{"eTag": "\\"76c348ff64953c932ada3a8a6b5b80f0\\"", "size": 43728, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T17:33:07.000Z", "contentLength": 43728, "httpStatusCode": 200}	00af75b0-edd1-48b0-b2da-dd5d299c552d	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
95e283cc-a5e7-4720-965b-394543d7e2ae	product-images	2/1789234387359-VP-MI-TR-UNICL-10P-PO3_6.webp	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-12 17:33:07.446513+00	2026-09-12 17:33:07.446513+00	2026-09-12 17:33:07.446513+00	{"eTag": "\\"f3507abdc1103b438856cce566ef4567\\"", "size": 65298, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T17:33:08.000Z", "contentLength": 65298, "httpStatusCode": 200}	92d26afe-11ac-4ae1-afd9-11cdeecd9caf	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
a0ebb4ae-ae9f-4312-b2d7-18c98dd20435	product-images	2/1789234387873-VP-MI-TR-UNICL-10P-PO3_2.webp	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-12 17:33:07.912854+00	2026-09-12 17:33:07.912854+00	2026-09-12 17:33:07.912854+00	{"eTag": "\\"13ef3bfde67f7c2e0f1e9aaf30bd7ede\\"", "size": 59140, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T17:33:08.000Z", "contentLength": 59140, "httpStatusCode": 200}	01cbbf27-ae3d-46a0-953b-6f181f1ff4f5	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
3355f0b2-2a07-4e8f-804e-00e7e67c4af0	product-images	2/1789234388334-VP-MI-TR-UNICL-10P-PO3_7.webp	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-12 17:33:08.319396+00	2026-09-12 17:33:08.319396+00	2026-09-12 17:33:08.319396+00	{"eTag": "\\"fe80a17c0eaaec969b51cfb20af3d893\\"", "size": 32466, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T17:33:09.000Z", "contentLength": 32466, "httpStatusCode": 200}	3d33d9a9-da88-4d69-bdf6-c1ffd5255920	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
efaa01b6-bf80-4f9a-8aaf-3b8d8c408a6d	brand-logos	1789235231200-Frenchie.webp	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-12 17:47:14.267823+00	2026-09-12 17:47:14.267823+00	2026-09-12 17:47:14.267823+00	{"eTag": "\\"9743702ceec27877731ee320ff64586b\\"", "size": 23570, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T17:47:15.000Z", "contentLength": 23570, "httpStatusCode": 200}	0603a9eb-62ec-4a61-a807-b8e566b3e6ac	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
a0c2ab24-00e8-4175-9909-588d3dc871bc	product-images	3/1789235545648-BRIEFFRENCHIEPLUSBLACKM_7.webp	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-12 17:52:31.889351+00	2026-09-12 17:52:31.889351+00	2026-09-12 17:52:31.889351+00	{"eTag": "\\"76e05207db876e622e61650e3cce139c\\"", "size": 36338, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T17:52:32.000Z", "contentLength": 36338, "httpStatusCode": 200}	20f03723-3073-41eb-939b-749ed1121f64	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
df566b39-5ca9-4696-915d-86bd50e3553f	product-images	3/1789235552367-BRIEFFRENCHIEPLUSFORESTGREENM_1.webp	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-12 17:52:32.815909+00	2026-09-12 17:52:32.815909+00	2026-09-12 17:52:32.815909+00	{"eTag": "\\"48a685147337254b79642e94b058532b\\"", "size": 87310, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T17:52:33.000Z", "contentLength": 87310, "httpStatusCode": 200}	550b4bbe-d214-4c04-8300-961ad8a0851a	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
4de5d6f9-577d-4b91-aabb-0e81f41840bb	product-images	3/1789235553555-Plus_1_40.webp	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-12 17:52:34.606164+00	2026-09-12 17:52:34.606164+00	2026-09-12 17:52:34.606164+00	{"eTag": "\\"de7d0ab70021c560e61796e011615528\\"", "size": 94184, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T17:52:35.000Z", "contentLength": 94184, "httpStatusCode": 200}	aa8eed3b-8181-4bcd-b27d-53a0315b03a7	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
a09d3fa2-3e61-45aa-8b3e-0a9dbfd78437	product-images	3/1789235555190-Plus_1_3.webp	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-12 17:52:35.775541+00	2026-09-12 17:52:35.775541+00	2026-09-12 17:52:35.775541+00	{"eTag": "\\"7c4003466419573fb594b5d177852504\\"", "size": 85470, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T17:52:36.000Z", "contentLength": 85470, "httpStatusCode": 200}	b10cb873-7d69-46ff-8800-c83f15ccbe0b	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
ab19d6f4-8476-41c7-b1b0-c943612f5bf1	product-images	3/1789235556377-BRIEFFRENCHIEPLUSNAVYBLUEM_5.webp	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-12 17:52:37.070463+00	2026-09-12 17:52:37.070463+00	2026-09-12 17:52:37.070463+00	{"eTag": "\\"db4ab9d0971095ad128f734cda69dd0a\\"", "size": 112212, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T17:52:38.000Z", "contentLength": 112212, "httpStatusCode": 200}	7c7e210d-381e-4364-83b3-3a4d1be0d6b0	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
50d7c8d3-d4f5-431a-a459-4988abe1cc7f	product-images	3/1789235557854-Plus_1_45.webp	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-12 17:52:38.112539+00	2026-09-12 17:52:38.112539+00	2026-09-12 17:52:38.112539+00	{"eTag": "\\"a87b68595153286ca65c3f507b208ba1\\"", "size": 78636, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T17:52:39.000Z", "contentLength": 78636, "httpStatusCode": 200}	5d5389b3-0d64-4c5c-be9d-9ac4025f0487	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
ee28dcc8-31fa-41b2-9cbf-6aa99f9a4db7	product-images	3/1789235558609-BRIEFFRENCHIEPLUSNAVYBLUEM_2.webp	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-12 17:52:38.946967+00	2026-09-12 17:52:38.946967+00	2026-09-12 17:52:38.946967+00	{"eTag": "\\"acf01ad45bdf3135cc039ddca05861c8\\"", "size": 73768, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T17:52:39.000Z", "contentLength": 73768, "httpStatusCode": 200}	f8557f13-d6fd-4d02-a57f-16625e5f676a	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
e29270fe-dbbe-4563-a9ca-bfc4bad17bd2	product-images	3/1789235559480-BRIEFFRENCHIEPLUSBLACKM_4.webp	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-12 17:52:39.581892+00	2026-09-12 17:52:39.581892+00	2026-09-12 17:52:39.581892+00	{"eTag": "\\"c691aef50208e80f85fed2d6b5ffa8c3\\"", "size": 48984, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T17:52:40.000Z", "contentLength": 48984, "httpStatusCode": 200}	196916e0-1cce-4a33-bf54-ca405be468b5	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
f1629b9b-74e5-43c5-9734-ce26252fb865	product-images	3/1789235560367-BRIEFFRENCHIEPLUSFORESTGREENM_3.webp	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-12 17:52:40.596599+00	2026-09-12 17:52:40.596599+00	2026-09-12 17:52:40.596599+00	{"eTag": "\\"4d431d8fd4f9dad0cb81855b4b4ca253\\"", "size": 72126, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T17:52:41.000Z", "contentLength": 72126, "httpStatusCode": 200}	8b6d21b1-a9f3-43f1-9e3a-4b70c7077269	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
d78fec9c-e52e-4b31-9840-23ad1897b53e	product-images	3/1789235561492-BRIEFFRENCHIEPLUSBLACKM_1.webp	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-12 17:52:41.473181+00	2026-09-12 17:52:41.473181+00	2026-09-12 17:52:41.473181+00	{"eTag": "\\"a28997002dbc78f8888cde32cf9f2010\\"", "size": 58438, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T17:52:42.000Z", "contentLength": 58438, "httpStatusCode": 200}	d04223c5-b833-44c0-ae90-b485296780e5	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
4d276451-632f-4a6a-a385-a4c20650a292	product-images	4/1789236556338-VIP7546.webp	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-12 18:09:16.410378+00	2026-09-12 18:09:16.410378+00	2026-09-12 18:09:16.410378+00	{"eTag": "\\"eb40ad75588ab68f534eedb1849c38fa\\"", "size": 39990, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T18:09:17.000Z", "contentLength": 39990, "httpStatusCode": 200}	092ebe15-45d4-48d9-8c25-24e1d9086e31	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
51771ca5-6ba9-4cf6-bbd4-a9bea2ecc80a	product-images	4/1789236557620-VIP7559.webp	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-12 18:09:17.738456+00	2026-09-12 18:09:17.738456+00	2026-09-12 18:09:17.738456+00	{"eTag": "\\"b1a0c448bc80a9b43cf3e12a2326ee8e\\"", "size": 39260, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T18:09:18.000Z", "contentLength": 39260, "httpStatusCode": 200}	37ca52e1-3b0a-4627-8aed-10f08fdf34d0	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
97e9f66c-aab2-4870-859d-f67bfc11b610	product-images	4/1789236558243-VIP7564.webp	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-12 18:09:18.297105+00	2026-09-12 18:09:18.297105+00	2026-09-12 18:09:18.297105+00	{"eTag": "\\"c2ab700a83d2051b7c74e8ad79b31f46\\"", "size": 23204, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T18:09:19.000Z", "contentLength": 23204, "httpStatusCode": 200}	3aa711a6-98e8-4181-8fd6-200acb19172b	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
0858e8c0-344a-4b54-a0e5-e70ebf476a73	product-images	4/1789236558815-VIP7551.webp	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-12 18:09:18.88098+00	2026-09-12 18:09:18.88098+00	2026-09-12 18:09:18.88098+00	{"eTag": "\\"a5ad62a85162b46920e84da03b4bd6a0\\"", "size": 50824, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T18:09:19.000Z", "contentLength": 50824, "httpStatusCode": 200}	9da702b6-b9a1-4803-ba5b-a434dd27d761	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
326060b9-cbc8-4e30-ae88-919b70602220	product-images	4/1789236560627-VIP7544.webp	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-12 18:09:20.708257+00	2026-09-12 18:09:20.708257+00	2026-09-12 18:09:20.708257+00	{"eTag": "\\"2a0891aa01ef1e8795774e9bcf598052\\"", "size": 37700, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T18:09:21.000Z", "contentLength": 37700, "httpStatusCode": 200}	dd63f93a-fe2e-42c4-b191-63829d836ba3	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
4c9f33ba-8488-401a-9f7b-0fd51b42a6fa	product-images	4/1789236561203-VIP7569.webp	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-12 18:09:21.399896+00	2026-09-12 18:09:21.399896+00	2026-09-12 18:09:21.399896+00	{"eTag": "\\"0e7ea677d56ae7e0de6e0f183fb30224\\"", "size": 35922, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T18:09:22.000Z", "contentLength": 35922, "httpStatusCode": 200}	23b08152-e95a-40db-a531-280bfa242d5c	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
1614bc5c-9f04-4d43-85f6-455d08f7726a	product-images	4/1789286634599-VIP7842.webp	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-13 08:03:57.145056+00	2026-09-13 08:03:57.145056+00	2026-09-13 08:03:57.145056+00	{"eTag": "\\"7f29ccd5899e0402be789ee745f98d26\\"", "size": 49298, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-13T08:03:58.000Z", "contentLength": 49298, "httpStatusCode": 200}	a99dd8ef-20a1-43d9-b7aa-5684c0608f7d	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
c4f9f242-3962-4cc5-bc98-9bd084904ff0	product-images	4/1789286637781-VIP7818.webp	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-13 08:03:57.936035+00	2026-09-13 08:03:57.936035+00	2026-09-13 08:03:57.936035+00	{"eTag": "\\"875359cd09b6609c2d184eaf7cf59b3f\\"", "size": 45492, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-13T08:03:58.000Z", "contentLength": 45492, "httpStatusCode": 200}	f2bcdc35-1485-45bb-bf8d-3e7c8e073ff2	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
f5237749-1895-438a-b51c-5698a6b2db46	product-images	4/1789286638369-VIP7830.webp	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-13 08:03:58.619574+00	2026-09-13 08:03:58.619574+00	2026-09-13 08:03:58.619574+00	{"eTag": "\\"2f2888b87bd43a128d640de7402e248d\\"", "size": 97634, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-13T08:03:59.000Z", "contentLength": 97634, "httpStatusCode": 200}	c9c3fe37-6ebf-478f-ba1c-10db682377c4	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
51c51ed6-db2a-430a-9273-45346f3580ea	product-images	4/1789286639041-VIP7827.webp	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-13 08:03:59.397755+00	2026-09-13 08:03:59.397755+00	2026-09-13 08:03:59.397755+00	{"eTag": "\\"8fce6856a69b1d858c731ac832acfe06\\"", "size": 61076, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-13T08:04:00.000Z", "contentLength": 61076, "httpStatusCode": 200}	cd90986f-ed6e-43ce-9e99-17024fba487d	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
d7bc52ac-a5aa-4e64-89d6-3cc759073049	product-images	4/1789286639819-VIP7834.webp	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-13 08:04:00.149044+00	2026-09-13 08:04:00.149044+00	2026-09-13 08:04:00.149044+00	{"eTag": "\\"89cc36b907501ca28e5e5ccf3d45b37f\\"", "size": 70388, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-13T08:04:01.000Z", "contentLength": 70388, "httpStatusCode": 200}	5c2cefa3-0203-4719-8191-39366fce4e6b	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
329749fc-2536-40b6-8995-5c3cfbaa26ef	product-images	4/1789286640570-VIP7823.webp	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-13 08:04:00.805627+00	2026-09-13 08:04:00.805627+00	2026-09-13 08:04:00.805627+00	{"eTag": "\\"63c43a1d36cd4ad91f35c1f73d8744ab\\"", "size": 60946, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-13T08:04:01.000Z", "contentLength": 60946, "httpStatusCode": 200}	4d39158f-1117-4d07-8a8a-7b516d1146f3	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
cee10d54-2adf-4fad-89f1-5fcfe5623fbc	product-images	4/1789286641292-VIP7821.webp	132f5f5b-74b2-456a-9f86-976df91c3809	2026-09-13 08:04:01.55761+00	2026-09-13 08:04:01.55761+00	2026-09-13 08:04:01.55761+00	{"eTag": "\\"e9a6208a3cba8f17e51f6bd8776fde6a\\"", "size": 67524, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-13T08:04:02.000Z", "contentLength": 67524, "httpStatusCode": 200}	60988456-d229-48b7-b7cc-731f5a9f303b	132f5f5b-74b2-456a-9f86-976df91c3809	{}	\N	f	f
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."s3_multipart_uploads" ("id", "in_progress_size", "upload_signature", "bucket_id", "key", "version", "owner_id", "created_at", "user_metadata", "metadata") FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."s3_multipart_uploads_parts" ("id", "upload_id", "size", "part_number", "bucket_id", "key", "etag", "owner_id", "version", "created_at") FROM stdin;
\.


--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."vector_indexes" ("id", "name", "bucket_id", "data_type", "dimension", "distance_metric", "metadata_configuration", "created_at", "updated_at") FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 14, true);


--
-- Name: addresses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."addresses_id_seq"', 1, true);


--
-- Name: brands_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."brands_id_seq"', 3, true);


--
-- Name: carousels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."carousels_id_seq"', 2, true);


--
-- Name: cart_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."cart_id_seq"', 1, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."categories_id_seq"', 4, true);


--
-- Name: colors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."colors_id_seq"', 22, true);


--
-- Name: coupons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."coupons_id_seq"', 1, false);


--
-- Name: inventory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."inventory_id_seq"', 40, true);


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."order_items_id_seq"', 1, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."orders_id_seq"', 1, true);


--
-- Name: product_colors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."product_colors_id_seq"', 5, true);


--
-- Name: product_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."product_images_id_seq"', 38, true);


--
-- Name: product_sizes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."product_sizes_id_seq"', 20, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."products_id_seq"', 4, true);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."reviews_id_seq"', 1, false);


--
-- Name: sizes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."sizes_id_seq"', 8, true);


--
-- Name: subcategories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."subcategories_id_seq"', 3, true);


--
-- Name: wishlist_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."wishlist_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

-- \unrestrict s5z9Kh2AwbI8TnU31hrfgFHhzQMkz2sGXRBWPYj8OBvdCpzh3ABknj5jNSl6aja

RESET ALL;
