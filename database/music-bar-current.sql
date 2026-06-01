--
-- PostgreSQL database dump
--

-- Dumped from database version 17.10 (6a49db4)
-- Dumped by pg_dump version 17.5 (Homebrew)

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: active_players; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.active_players (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id character varying(255) NOT NULL,
    device_name character varying(255) NOT NULL,
    device_type character varying(50) NOT NULL,
    is_active boolean DEFAULT true,
    last_ping timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: app_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_settings (
    id integer NOT NULL,
    key character varying(100) NOT NULL,
    value text,
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: app_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.app_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: app_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.app_settings_id_seq OWNED BY public.app_settings.id;


--
-- Name: playlist_songs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.playlist_songs (
    id integer NOT NULL,
    playlist_id integer,
    youtube_id character varying(20) NOT NULL,
    title character varying(500) NOT NULL,
    thumbnail character varying(500),
    duration character varying(20),
    artist character varying(255),
    "position" integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: playlist_songs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.playlist_songs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: playlist_songs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.playlist_songs_id_seq OWNED BY public.playlist_songs.id;


--
-- Name: playlists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.playlists (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    is_default boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    is_enabled boolean DEFAULT true
);


--
-- Name: playlists_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.playlists_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: playlists_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.playlists_id_seq OWNED BY public.playlists.id;


--
-- Name: song_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.song_requests (
    id integer NOT NULL,
    youtube_id character varying(20) NOT NULL,
    title character varying(500) NOT NULL,
    thumbnail character varying(500),
    duration character varying(20),
    requested_by character varying(100),
    status character varying(20) DEFAULT 'pending'::character varying,
    played_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    device_id character varying(100)
);


--
-- Name: song_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.song_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: song_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.song_requests_id_seq OWNED BY public.song_requests.id;


--
-- Name: app_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_settings ALTER COLUMN id SET DEFAULT nextval('public.app_settings_id_seq'::regclass);


--
-- Name: playlist_songs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.playlist_songs ALTER COLUMN id SET DEFAULT nextval('public.playlist_songs_id_seq'::regclass);


--
-- Name: playlists id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.playlists ALTER COLUMN id SET DEFAULT nextval('public.playlists_id_seq'::regclass);


--
-- Name: song_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.song_requests ALTER COLUMN id SET DEFAULT nextval('public.song_requests_id_seq'::regclass);


--
-- Data for Name: active_players; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.active_players (id, device_id, device_name, device_type, is_active, last_ping, created_at) FROM stdin;
244f72a8-c564-44b4-87ca-acded2adea3c	d22932c9-e5cb-4996-ac24-f01e7f40ef44	Desktop Player	Desktop	t	2026-06-01 01:28:11.217332+00	2026-05-30 09:44:54.451775+00
4260d129-2587-4b1e-8c13-ef5e5855721c	b5c5d034-a86d-45c2-8de9-d93b5c15ee15	Mobile Player	Mobile	t	2026-06-01 01:28:14.793024+00	2026-05-30 10:04:43.335986+00
dfdcadc9-031a-4aff-93e0-57ce76ac0234	dev_vqmayljv_moy83k8d	Mobile Player	Mobile	t	2026-05-31 03:24:02.959711+00	2026-05-30 10:21:45.017777+00
5e1ac7b1-1790-4f09-a9a8-04f6ddd6b35a	fb12af65-95a8-4ac0-8358-0f8f67bf8cbe	Mobile Player	Mobile	t	2026-05-31 03:24:37.498667+00	2026-05-30 10:21:07.207856+00
a091837c-69bc-43bd-a84a-50db3f00d0bb	b8568b0e-6255-409c-a5ec-b2b333f0b1e5	Desktop Player	Desktop	t	2026-06-01 01:28:18.740522+00	2026-06-01 01:24:58.102342+00
fa51363b-c4b1-4d48-afe3-cc7372195da3	4a772d94-0794-41b8-93d2-5149e64fe5ff	Desktop Player	Desktop	t	2026-05-30 10:06:31.063443+00	2026-05-30 10:03:59.828338+00
c1b30818-dab9-4406-800f-30c2be01a8ab	56a0dac2-fedf-4e4f-8300-eab1c34d804a	Mobile Player	Mobile	t	2026-05-30 10:23:15.954557+00	2026-05-30 10:22:39.203127+00
655023f9-ae49-4bfa-8c6e-0b896a1ec494	cb4c572b-6e9f-43f4-b2a5-3439822e80ef	Desktop Player	Desktop	t	2026-06-01 01:23:55.129762+00	2026-06-01 01:23:55.129762+00
67ac53fa-fe31-4737-8d40-451c1ea7b67f	0d4a1092-9d62-49c7-ae80-006efa7b57f0	Desktop Player	Desktop	t	2026-06-01 01:23:56.375805+00	2026-06-01 01:23:55.133698+00
ad6f780d-cbfe-4821-87ad-a35ff7fd3126	305451be-b8bc-4db8-b29b-de02e59a02e4	Desktop Player	Desktop	t	2026-05-31 15:32:23.994402+00	2026-05-31 09:30:28.646346+00
\.


--
-- Data for Name: app_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.app_settings (id, key, value, updated_at) FROM stdin;
1	admin_pin	1234	2026-05-09 06:09:08.799856
2	is_requests_enabled	true	2026-05-30 09:54:08.896089
4	active_playlist_ids	[17]	2026-06-01 00:28:13.226834
\.


--
-- Data for Name: playlist_songs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.playlist_songs (id, playlist_id, youtube_id, title, thumbnail, duration, artist, "position", created_at) FROM stdin;
1	1	fOMWjbuxsho	เพื่อนสนิท - Endorphine【OFFICIAL MV】	https://i.ytimg.com/vi/fOMWjbuxsho/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	1	2026-05-09 06:49:37.512643
2	1	4EJb35Uco0M	โอ๊ย โอ๊ย : เบน ชลาทิศ [OFFICIAL MV]	https://i.ytimg.com/vi/4EJb35Uco0M/mqdefault.jpg	\N	BKP Music	2	2026-05-09 08:23:15.708934
3	2	Letk-EylsKM	ดอกไม้กับหัวใจ - I-ZAX 【OFFICIAL MV】	https://i.ytimg.com/vi/Letk-EylsKM/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	1	2026-05-09 08:23:44.883678
4	2	TXCqJv2IdaM	เกินใจจะอดทน - SYAM 【OFFICIAL MV】	https://i.ytimg.com/vi/TXCqJv2IdaM/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	2	2026-05-09 08:23:45.147971
5	2	vfmjxhvKiCg	ไม่เป็นอะไร  | ปราโมทย์ วิเลปะนะ	https://i.ytimg.com/vi/vfmjxhvKiCg/mqdefault.jpg	\N	tortae2	3	2026-05-09 08:23:45.435952
6	2	O4-3pewcDEY	สิทธิ์ของเธอ - อัสนี โชติกุล, วสันต์ โชติกุล【OFFICIAL MV】	https://i.ytimg.com/vi/O4-3pewcDEY/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	4	2026-05-09 08:23:45.701528
7	2	9SM2hywQIVo	เล่าสู่กันฟัง - เบิร์ด ธงไชย 【OFFICIAL MV】	https://i.ytimg.com/vi/9SM2hywQIVo/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	5	2026-05-09 08:23:45.959327
8	2	9QK-XRfLQr8	ขอเช็ดน้ำตา - CLASH【OFFICIAL MV】	https://i.ytimg.com/vi/9QK-XRfLQr8/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	6	2026-05-09 08:23:46.225505
9	2	NiRSxtTzu1k	ส่วนเกิน - PEACEMAKER【OFFICIAL MV】	https://i.ytimg.com/vi/NiRSxtTzu1k/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	7	2026-05-09 08:23:46.484265
10	2	qa7uHvPRU48	เกิดมาแค่รักกัน - Big Ass【OFFICIAL MV】	https://i.ytimg.com/vi/qa7uHvPRU48/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	8	2026-05-09 08:23:46.747776
11	2	SXy-v1KbF4k	ฝนตกที่หน้าต่าง - LOSO 【OFFICIAL MV】	https://i.ytimg.com/vi/SXy-v1KbF4k/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	9	2026-05-09 08:23:47.00596
12	2	A1ncrVtr9Es	เพลง ของขวัญ- Musketeers	https://i.ytimg.com/vi/A1ncrVtr9Es/mqdefault.jpg	\N	aum winner	10	2026-05-09 08:23:47.270572
13	2	ZCJ6kpm0tjc	ใจเธอกอดใคร - Neo-X [Official MV]	https://i.ytimg.com/vi/ZCJ6kpm0tjc/mqdefault.jpg	\N	rsfriends	11	2026-05-09 08:23:47.530072
14	2	Ziqv2Gsw02E	ชั่วฟ้าดินสลาย - พลพล 【OFFICIAL MV】	https://i.ytimg.com/vi/Ziqv2Gsw02E/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	12	2026-05-09 08:23:47.794289
15	2	L1qU7Y_atM8	คบไม่ได้ - ป้าง นครินทร์ กิ่งศักดิ์【OFFICIAL MV】	https://i.ytimg.com/vi/L1qU7Y_atM8/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	13	2026-05-09 08:23:48.068082
16	2	mDa8FfZkntA	อย่างน้อย - Big Ass (Ost.ปิดเทอมใหญ่ฯ)【OFFICIAL MV】	https://i.ytimg.com/vi/mDa8FfZkntA/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	14	2026-05-09 08:23:48.333724
17	2	79qwUtFnpJs	รักแท้ ดูแลไม่ได้ - Potato【OFFICIAL MV】	https://i.ytimg.com/vi/79qwUtFnpJs/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	15	2026-05-09 08:23:48.612632
18	2	k73IcXf4hK4	Singular - เบาเบา	https://i.ytimg.com/vi/k73IcXf4hK4/mqdefault.jpg	\N	SingularVEVO	16	2026-05-09 08:23:50.684291
19	2	e-IaqaVHuQ8	ใจน้อย - AB NORMAL【OFFICIAL MV】	https://i.ytimg.com/vi/e-IaqaVHuQ8/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	17	2026-05-09 08:23:50.956116
20	2	ikBQVdE6z4I	ไม่ต้องมีคำบรรยาย - MR.TEAM 【OFFICIAL MV】	https://i.ytimg.com/vi/ikBQVdE6z4I/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	18	2026-05-09 08:23:51.223665
21	2	ZhUg-r69zSg	14 อีกครั้ง - เสก โลโซ【OFFICIAL MV】	https://i.ytimg.com/vi/ZhUg-r69zSg/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	19	2026-05-09 08:23:51.577401
22	2	ORm5W_hjtfY	100 เหตุผล - STER 【OFFICIAL MV】	https://i.ytimg.com/vi/ORm5W_hjtfY/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	20	2026-05-09 08:23:51.893069
23	2	eLRGEvX0vQc	หากตอนนี้เธอยังไม่เกิด - TAXI【OFFICIAL MV】	https://i.ytimg.com/vi/eLRGEvX0vQc/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	21	2026-05-09 08:23:52.186253
24	2	WCKC8gagOwM	อิจฉา : ศร [Official MV]	https://i.ytimg.com/vi/WCKC8gagOwM/mqdefault.jpg	\N	rsfriends	22	2026-05-09 08:23:52.452313
25	2	Lttip5f8R1Q	ก้อนหินก้อนนั้น - โรส ศิรินทิพย์【OFFICIAL MV】	https://i.ytimg.com/vi/Lttip5f8R1Q/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	23	2026-05-09 08:23:53.834092
26	2	cci7_Zf6nfA	ให้ฉันดูแลเธอ (Ost.ละครผู้ใหญ่ลีกับนางมา) - แหนม รณเดช 【OFFICIAL MV】	https://i.ytimg.com/vi/cci7_Zf6nfA/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	24	2026-05-09 08:23:54.102636
27	2	Kl9wZ7qrnfg	ไว้ใจ๋ได้กา - ลานนา คัมมินส์【OFFICIAL MV】	https://i.ytimg.com/vi/Kl9wZ7qrnfg/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	25	2026-05-09 08:23:54.372616
28	2	a__R_dumrMc	สุดที่รัก - Retrospect【OFFICIAL MV】	https://i.ytimg.com/vi/a__R_dumrMc/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	26	2026-05-09 08:23:54.746557
29	2	v6AX4ESWozU	คนหลงทาง - Big Ass【OFFICIAL MV】	https://i.ytimg.com/vi/v6AX4ESWozU/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	27	2026-05-09 08:23:55.03109
30	2	-zY3jOcahJU	เธอเปลี่ยนไป - Syam【OFFICIAL MV】	https://i.ytimg.com/vi/-zY3jOcahJU/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	28	2026-05-09 08:23:55.294213
31	2	xoP_kqiqRgM	เลือกได้ไหม - ZAZA 【OFFICIAL MV】	https://i.ytimg.com/vi/xoP_kqiqRgM/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	29	2026-05-09 08:23:55.556701
32	2	-y-CxK0TW_0	เรื่องบนเตียง - บอย Peacemaker【OFFICIAL MV】	https://i.ytimg.com/vi/-y-CxK0TW_0/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	30	2026-05-09 08:23:55.872199
33	2	vOFIxSQ2vi4	STAMP : ความคิด [Official MV]	https://i.ytimg.com/vi/vOFIxSQ2vi4/mqdefault.jpg	\N	LOVEiS	31	2026-05-09 08:23:56.137877
34	2	zvhmCLqndlQ	อยากรู้...แต่ไม่อยากถาม - Calories Blah Blah【OFFICIAL MV】	https://i.ytimg.com/vi/zvhmCLqndlQ/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	32	2026-05-09 08:23:56.39991
35	2	x93nZql9y04	อยู่อย่างเหงาเหงา - บอย Peacemaker 【OFFICIAL MV】	https://i.ytimg.com/vi/x93nZql9y04/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	33	2026-05-09 08:23:56.665824
36	2	qgZ96OkkYec	คนดีๆทำไมไม่รัก - ไอซ์ ศรัณยู【OFFICIAL MV】	https://i.ytimg.com/vi/qgZ96OkkYec/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	34	2026-05-09 08:23:56.926688
37	2	r3OxQBHknVk	พูดไม่ค่อยเก่ง - AB NORMAL 【OFFICIAL MV】	https://i.ytimg.com/vi/r3OxQBHknVk/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	35	2026-05-09 08:23:57.193798
38	2	xlMpYw06Is0	คนของเธอ - แมว จิรศักดิ์ ปานพุ่ม 【OFFICIAL MV】	https://i.ytimg.com/vi/xlMpYw06Is0/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	36	2026-05-09 08:23:57.513668
39	2	8e7yZJzDZiA	เหตุผล - BLACKHEAD  【OFFICIAL MV】	https://i.ytimg.com/vi/8e7yZJzDZiA/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	37	2026-05-09 08:23:57.780628
40	2	loKTOPF8bdI	อยากให้รู้ว่ารักเธอ : Joni Anwar [Official MV]	https://i.ytimg.com/vi/loKTOPF8bdI/mqdefault.jpg	\N	rsfriends	38	2026-05-09 08:23:58.042922
41	2	GzzMNvXFxBc	พรุ่งนี้ - เสก โลโซ 【OFFICIAL MV】	https://i.ytimg.com/vi/GzzMNvXFxBc/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	39	2026-05-09 08:23:58.311799
42	2	xhR-HIje1O4	พรหมลิขิต - Big Ass【OFFICIAL MV】	https://i.ytimg.com/vi/xhR-HIje1O4/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	40	2026-05-09 08:23:58.57236
43	2	PC7Q_TnL8Ug	เมื่อเขามา...ฉันจะไป - Endorphine【OFFICIAL MV】	https://i.ytimg.com/vi/PC7Q_TnL8Ug/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	41	2026-05-09 08:23:58.837427
44	2	Y_SRBuKWZa8	คนเจียมตัว - SO COOL【OFFICIAL MV】	https://i.ytimg.com/vi/Y_SRBuKWZa8/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	42	2026-05-09 08:23:59.098788
45	2	SVfWoc6YGLQ	ทำไมไม่รับสักที : DREAMS ฝ้าย,ลีเดีย,เม [Official MV]	https://i.ytimg.com/vi/SVfWoc6YGLQ/mqdefault.jpg	\N	rsfriends	43	2026-05-09 08:23:59.363991
46	2	WkPgfsMYn14	ไม่ให้เธอไป - POTATO【OFFICIAL MV】	https://i.ytimg.com/vi/WkPgfsMYn14/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	44	2026-05-09 08:24:01.510106
47	2	fFOcl98VKDs	ว่างแล้วช่วยโทรกลับ : Lydia [Official MV]	https://i.ytimg.com/vi/fFOcl98VKDs/mqdefault.jpg	\N	rsfriends	45	2026-05-09 08:24:01.916409
48	2	zRX3ZCBiRl0	ซบที่อกฉัน - Clash【OFFICIAL MV】	https://i.ytimg.com/vi/zRX3ZCBiRl0/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	46	2026-05-09 08:24:02.180878
49	2	yWjH0Ci2nSE	แค่คนอีกคน - ปราโมทย์ วิเลปะนะ【OFFICIAL MV】	https://i.ytimg.com/vi/yWjH0Ci2nSE/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	47	2026-05-09 08:24:02.444003
50	2	Bh4e1QkrkHY	ใจให้ไป - โอ้ เสกสรรค์【OFFICIAL MV】	https://i.ytimg.com/vi/Bh4e1QkrkHY/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	48	2026-05-09 08:24:02.735733
51	2	TnALxy7-EyU	ที่หนึ่งไม่ไหว : ไอ..น้ำ [Official MV]	https://i.ytimg.com/vi/TnALxy7-EyU/mqdefault.jpg	\N	rsfriends	49	2026-05-09 08:24:02.997427
52	2	EDm5_shOVb0	ยังยิ้มได้ - พลพล【OFFICIAL MV】	https://i.ytimg.com/vi/EDm5_shOVb0/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	50	2026-05-09 08:24:03.260409
53	2	ZqUDx2YdHEc	ไม่ขอเป็นคนสุดท้าย : BADZ [Official MV]	https://i.ytimg.com/vi/ZqUDx2YdHEc/mqdefault.jpg	\N	rsfriends	51	2026-05-09 08:24:03.523631
54	2	UqFKzVUyz2c	ต้องโทษดาว - เบิร์ด ธงไชย 【OFFICIAL MV】	https://i.ytimg.com/vi/UqFKzVUyz2c/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	52	2026-05-09 08:24:03.791843
55	2	DM1Ke0NdODs	เจียมตัว - Syam【OFFICIAL MV】	https://i.ytimg.com/vi/DM1Ke0NdODs/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	53	2026-05-09 08:24:04.051838
56	2	heRCAbBJksA	ความเจ็บปวด - Palmy【OFFICIAL MV】	https://i.ytimg.com/vi/heRCAbBJksA/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	54	2026-05-09 08:24:04.317824
57	2	zBG8Ica6U3Y	สิ่งสำคัญ - Endorphine【OFFICIAL MV】	https://i.ytimg.com/vi/zBG8Ica6U3Y/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	55	2026-05-09 08:24:04.580209
58	2	2diZSLLarMY	ดูแลเขาให้ดีดี - ดา เอ็นโดรฟิน【OFFICIAL MV】	https://i.ytimg.com/vi/2diZSLLarMY/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	56	2026-05-09 08:24:04.843062
59	2	3nYd5YOTlmc	BOY PEACEMAKER - ความอ่อนแอ	https://i.ytimg.com/vi/3nYd5YOTlmc/mqdefault.jpg	\N	duckbarteam	57	2026-05-09 08:24:05.101678
60	2	uPhAaYupwOk	คนมันรัก -  ไอซ์ ศรัณยู 【OFFICIAL MV】	https://i.ytimg.com/vi/uPhAaYupwOk/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	58	2026-05-09 08:24:05.397709
61	2	K2ynPjhXkEw	ใจฉันเป็นของเธอ (Ost. ใจร้าว) - บอย Peacemaker【OFFICIAL MV】	https://i.ytimg.com/vi/K2ynPjhXkEw/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	59	2026-05-09 08:24:05.658575
62	2	QnJm2eGmoCY	รักครั้งแรก - บางแก้ว【OFFICIAL MV】	https://i.ytimg.com/vi/QnJm2eGmoCY/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	60	2026-05-09 08:24:06.056892
63	2	vQIlBv7knWY	Jetset'er - จูบ(Kiss)	https://i.ytimg.com/vi/vQIlBv7knWY/mqdefault.jpg	\N	mahagahp atom	61	2026-05-09 08:24:06.318518
64	2	IIDFcMkh8II	หัวใจกระดาษ : อู๋ ธรรพ์ณธร [Official MV]	https://i.ytimg.com/vi/IIDFcMkh8II/mqdefault.jpg	\N	rsfriends	62	2026-05-09 08:24:06.584923
65	2	9lGiUC7m16Y	มากกว่ารัก - พีท The Star【OFFICIAL MV】	https://i.ytimg.com/vi/9lGiUC7m16Y/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	63	2026-05-09 08:24:06.939357
66	2	0hS6lVIt3s0	เราคงต้องเป็นแฟนกัน - พั้นช์【OFFICIAL MV】	https://i.ytimg.com/vi/0hS6lVIt3s0/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	64	2026-05-09 08:24:07.207258
67	2	zDOTnLIbffA	ทาทา ยัง -  อยากเก็บเธอไว้ทั้งสองคน	https://i.ytimg.com/vi/zDOTnLIbffA/mqdefault.jpg	\N	TATAYOUNGMUSICNL	65	2026-05-09 08:24:07.465897
68	2	aA6ZdOUp3Qc	Miss Call - Senorita【OFFICIAL MV】	https://i.ytimg.com/vi/aA6ZdOUp3Qc/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	66	2026-05-09 08:24:07.730407
69	2	o0dvEKlXzSw	ขอบใจนะ - แพรว คณิตกุล【OFFICIAL MV】	https://i.ytimg.com/vi/o0dvEKlXzSw/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	67	2026-05-09 08:24:08.024437
70	2	LLsz9qM4pJ8	Singular - ลอง	https://i.ytimg.com/vi/LLsz9qM4pJ8/mqdefault.jpg	\N	SingularVEVO	68	2026-05-09 08:24:08.291001
71	2	WrFnxSDdpvw	แชร์ (Share) - POTATO【OFFICIAL MV】	https://i.ytimg.com/vi/WrFnxSDdpvw/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	69	2026-05-09 08:24:08.551229
72	2	aa9er8EMrvk	ต่อหน้าฉัน (เธอทำอย่างนั้นได้อย่างไร) : D2B | Official MV	https://i.ytimg.com/vi/aa9er8EMrvk/mqdefault.jpg	\N	rsfriends	70	2026-05-09 08:24:08.813034
73	2	Vnt5R20J9sw	เสียงของหัวใจ - แอน ธิติมา【OFFICIAL MV】	https://i.ytimg.com/vi/Vnt5R20J9sw/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	71	2026-05-09 08:24:09.072802
74	2	JYTYjVBw-lU	รออยู่ตรงนี้ - HUM【OFFICIAL MV】	https://i.ytimg.com/vi/JYTYjVBw-lU/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	72	2026-05-09 08:24:09.334002
75	2	vHlUd8MGgaw	จะเอาจากไหน - เบิร์ด ธงไชย【OFFICIAL MV】	https://i.ytimg.com/vi/vHlUd8MGgaw/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	73	2026-05-09 08:24:09.592426
76	2	1qXuBrdUj2g	คนที่ไม่เข้าตา - Calories Blah Blah【OFFICIAL MV】	https://i.ytimg.com/vi/1qXuBrdUj2g/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	74	2026-05-09 08:24:09.859173
77	2	CtLxoB1sQjk	แทงข้างหลัง..ทะลุถึงหัวใจ - อ๊อฟ ปองศักดิ์【OFFICIAL MV】	https://i.ytimg.com/vi/CtLxoB1sQjk/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	75	2026-05-09 08:24:10.118917
78	2	qMb-wXSdB-c	กลัวเธอรู้ - ตอง ภัครมัย【OFFICIAL MV】	https://i.ytimg.com/vi/qMb-wXSdB-c/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	76	2026-05-09 08:24:10.38541
79	2	Y9XXxZLNYX8	ได้ไหม...ถ้าฉันจะบอกว่ารักเธอ : Lydia [Official MV]	https://i.ytimg.com/vi/Y9XXxZLNYX8/mqdefault.jpg	\N	rsfriends	77	2026-05-09 08:24:10.646718
80	2	axxv2VroOJU	จุดอ่อนของฉันอยู่ที่หัวใจ (Ost. สวรรค์เบี่ยง) - อ๊อฟ ปองศักดิ์ 【OFFICIAL MV】	https://i.ytimg.com/vi/axxv2VroOJU/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	78	2026-05-09 08:24:10.935101
81	2	-zvDeioOcSo	อารมณ์สีเทา - Potato【OFFICIAL MV】	https://i.ytimg.com/vi/-zvDeioOcSo/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	79	2026-05-09 08:24:11.284722
82	2	9JXm73C0DvI	แค่ได้คิดถึง - ญารินดา【OFFICIAL MV】	https://i.ytimg.com/vi/9JXm73C0DvI/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	80	2026-05-09 08:24:11.588214
83	2	NSyEZdDD000	ฉันมีค่าแค่ไหน - Peacemaker【OFFICIAL MV】	https://i.ytimg.com/vi/NSyEZdDD000/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	81	2026-05-09 08:24:11.847439
84	2	uw5__MkV7AI	เธอคือหัวใจของฉัน - นิก รณวีร์【OFFICIAL MV】	https://i.ytimg.com/vi/uw5__MkV7AI/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	82	2026-05-09 08:24:12.113688
85	2	iUlTq0fZrLw	เธอจะอยู่กับฉันตลอดไป - Clash 【OFFICIAL MV】	https://i.ytimg.com/vi/iUlTq0fZrLw/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	83	2026-05-09 08:24:12.373727
86	2	tOKdQ0-2ky4	ช่างไม่รู้เลย - Peacemaker【OFFICIAL MV】	https://i.ytimg.com/vi/tOKdQ0-2ky4/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	84	2026-05-09 08:24:12.64137
87	2	f9ppNKO7WFQ	ความเดิมตอนที่แล้ว - Zaza【OFFICIAL MV】	https://i.ytimg.com/vi/f9ppNKO7WFQ/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	85	2026-05-09 08:24:12.901138
88	2	ZjQxGAY585Q	คนๆนี้จะไม่ไปจากเธอ : Soul Out [Official MV]	https://i.ytimg.com/vi/ZjQxGAY585Q/mqdefault.jpg	\N	rsfriends	86	2026-05-09 08:24:13.171865
89	2	x-NC3Lu7QXU	คืนใจ vacation band	https://i.ytimg.com/vi/x-NC3Lu7QXU/mqdefault.jpg	\N	Monawrl	87	2026-05-09 08:24:13.430837
90	2	QCZvwHRp1Ck	MV เธอหมุนรอบฉัน ฉันหมุนรอบเธอ	https://i.ytimg.com/vi/QCZvwHRp1Ck/mqdefault.jpg	\N	varnfake	88	2026-05-09 08:24:13.795388
91	2	rqc_oMjKUPg	ถามเอาอะไร - เต้น นรารักษ์【OFFICIAL MV】	https://i.ytimg.com/vi/rqc_oMjKUPg/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	89	2026-05-09 08:24:14.111835
92	2	iYm2Z8VUYnY	TMT - ที่เดิมในหัวใจ Second Place Feat. ตู่ ภพธร	https://i.ytimg.com/vi/iYm2Z8VUYnY/mqdefault.jpg	\N	Spicydisc	90	2026-05-09 08:24:14.427753
93	2	MFiqFczyI5A	นาฬิกาตาย - bodyslam【OFFICIAL MV】	https://i.ytimg.com/vi/MFiqFczyI5A/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	91	2026-05-09 08:24:14.716602
94	2	kXH-AMa7VnQ	ถ้า - MR.TEAM【OFFICIAL MV】	https://i.ytimg.com/vi/kXH-AMa7VnQ/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	92	2026-05-09 08:24:14.981691
95	2	f70ydNp8Fr0	หนึ่งในล้าน - Sniper【OFFICIAL MV】	https://i.ytimg.com/vi/f70ydNp8Fr0/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	93	2026-05-09 08:24:15.240441
96	2	gwLuQPjW8bQ	จากคนอื่นคนไกล - มาช่า วัฒนพานิช 【OFFICIAL MV】	https://i.ytimg.com/vi/gwLuQPjW8bQ/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	94	2026-05-09 08:24:15.506097
97	2	4VFfjujsRZk	ให้อภัยสักครั้ง : ซินเดอเรลล่า Cinderella [Official MV]	https://i.ytimg.com/vi/4VFfjujsRZk/mqdefault.jpg	\N	rsfriends	95	2026-05-09 08:24:15.842143
98	2	5pzhAG4wmT0	ก่อนมะลิบาน - TIME【OFFICIAL MV】	https://i.ytimg.com/vi/5pzhAG4wmT0/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	96	2026-05-09 08:24:16.108564
99	2	fpbcxVvlcUY	คิดถึง - PEACEMAKER (Produced By Mr.Lazy)	https://i.ytimg.com/vi/fpbcxVvlcUY/mqdefault.jpg	\N	werkgang	97	2026-05-09 08:24:16.558798
100	2	e2HlCwfXLEY	i need somebody (อยากขอสักคน) - บี้ สุกฤษฎิ์【OFFICIAL MV】	https://i.ytimg.com/vi/e2HlCwfXLEY/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	98	2026-05-09 08:24:16.868368
101	2	L18kBECZyLA	คนใจอ่อน (อ่อนใจ) : D2B [Official MV]	https://i.ytimg.com/vi/L18kBECZyLA/mqdefault.jpg	\N	rsfriends	99	2026-05-09 08:24:17.130229
102	2	yh4RDLgw08s	รักเธอที่สุด (YOU'RE THE ONE) - มิ้นท์ อรรถวดี【OFFICIAL MV】	https://i.ytimg.com/vi/yh4RDLgw08s/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	100	2026-05-09 08:24:17.56772
103	2	QpHLiS14oGk	เงารักลวงใจ - ใจฉันรักเธอคนเดียว	https://i.ytimg.com/vi/QpHLiS14oGk/mqdefault.jpg	\N	MusicCircusforGMM	101	2026-05-09 08:24:17.88978
104	2	AzIFZTI7i20	คนเจ้าน้ำตา - นิว จิ๋ว【OFFICIAL MV】	https://i.ytimg.com/vi/AzIFZTI7i20/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	102	2026-05-09 08:24:18.154136
105	2	w8XuzHl1XmU	อยากได้ยินว่ารักกัน - SEK LOSO【OFFICIAL MV】	https://i.ytimg.com/vi/w8XuzHl1XmU/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	103	2026-05-09 08:24:18.413978
106	2	UHIeh8cTuDA	เหงา - PEACEMAKER【OFFICIAL MV】	https://i.ytimg.com/vi/UHIeh8cTuDA/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	104	2026-05-09 08:24:18.678923
107	2	ECJs514R6CM	SEXY - PARADOX 【OFFICIAL MV】	https://i.ytimg.com/vi/ECJs514R6CM/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	105	2026-05-09 08:24:18.939685
108	2	THRPfobVABI	สองใจ - ธีรภัทร์ สัจจกุล 【OFFICIAL MV】	https://i.ytimg.com/vi/THRPfobVABI/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	106	2026-05-09 08:24:19.207675
109	2	ocOis6i5Yog	เธอมีจริง - ป้าง นครินทร์ กิ่งศักดิ์	https://i.ytimg.com/vi/ocOis6i5Yog/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	107	2026-05-09 08:24:19.466781
110	2	ECMNfNk1amo	ไม่มีใครรู้ - เป๊ก ผลิตโชค【OFFICIAL MV】	https://i.ytimg.com/vi/ECMNfNk1amo/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	108	2026-05-09 08:24:19.730463
111	2	ZqViGFZs_mg	ชิน ชินวุฒ - หัวใจไม่ใช่กระดาษ	https://i.ytimg.com/vi/ZqViGFZs_mg/mqdefault.jpg	\N	duckbarteam	109	2026-05-09 08:24:19.989879
112	2	zfu0b4Ko1GA	เรื่องธรรมดา : James เจมส์ เรืองศักดิ์ [Official MV]	https://i.ytimg.com/vi/zfu0b4Ko1GA/mqdefault.jpg	\N	rsfriends	110	2026-05-09 08:24:20.255768
113	2	AtreXqT16sQ	รู้ตัวช้า : JO-POP [Official MV]	https://i.ytimg.com/vi/AtreXqT16sQ/mqdefault.jpg	\N	rsfriends	111	2026-05-09 08:24:20.551413
114	2	5nPzf6viSgA	ระยะทำใจ - กัน นภัทร【OFFICIAL MV】	https://i.ytimg.com/vi/5nPzf6viSgA/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	112	2026-05-09 08:24:20.815595
115	2	2-fpjaP6bFI	STAMP : คนที่คุณก็รู้ว่าใคร [Official MV]	https://i.ytimg.com/vi/2-fpjaP6bFI/mqdefault.jpg	\N	LOVEiS	113	2026-05-09 08:24:21.075172
116	2	0EqnFaEtaww	รื้อฟื้น - ANNITA【OFFICIAL MV】	https://i.ytimg.com/vi/0EqnFaEtaww/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	114	2026-05-09 08:24:21.341403
117	2	tCrvB7O1M-4	เธอมากับฝน - เอ็กซ์ ฐิติ 【OFFICIAL MV】	https://i.ytimg.com/vi/tCrvB7O1M-4/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	115	2026-05-09 08:24:21.603469
118	2	u5lqDGFZba4	องศาเดียว - Cream【OFFICIAL MV】	https://i.ytimg.com/vi/u5lqDGFZba4/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	116	2026-05-09 08:24:21.873984
119	2	nmVrMXPCtN4	เธอคือนางฟ้าในใจ - Clash  【OFFICIAL MV】	https://i.ytimg.com/vi/nmVrMXPCtN4/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	117	2026-05-09 08:24:22.190025
120	2	agqDmzdMg60	ละครรักแท้ - Clash【OFFICIAL MV】	https://i.ytimg.com/vi/agqDmzdMg60/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	118	2026-05-09 08:24:22.454217
121	2	nvzKXP-Akr8	สุดท้าย - Peacemaker【OFFICIAL MV】	https://i.ytimg.com/vi/nvzKXP-Akr8/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	119	2026-05-09 08:24:22.909964
122	2	Qhw9JT1L2Po	นาทีสุดท้าย ETC.wmv	https://i.ytimg.com/vi/Qhw9JT1L2Po/mqdefault.jpg	\N	TongSoda	120	2026-05-09 08:24:23.175421
123	2	oIRLD--3PQ8	คนจะโดนทิ้ง : BOGIE & DODGE | โบกี้ & ดอดจ์ [Thank you version]	https://i.ytimg.com/vi/oIRLD--3PQ8/mqdefault.jpg	\N	rsfriends	121	2026-05-09 08:24:23.435261
124	2	P3sSWkrBe90	คู่แท้ - เบิร์ด ธงไชย【OFFICIAL MV】	https://i.ytimg.com/vi/P3sSWkrBe90/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	122	2026-05-09 08:24:23.708207
125	2	ZICo3dgXpuo	มากมาย - บี้ สุกฤษฎิ์【OFFICIAL MV】	https://i.ytimg.com/vi/ZICo3dgXpuo/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	123	2026-05-09 08:24:23.967723
126	2	_dkbfKzd01Y	อย่าบอกให้ใครรู้ - Turn On【OFFICIAL AUDIO】	https://i.ytimg.com/vi/_dkbfKzd01Y/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	124	2026-05-09 08:24:24.237107
127	2	kIcGLMcSTd0	ความทรงจำสีจาง - ปาล์มมี่【OFFICIAL MV】	https://i.ytimg.com/vi/kIcGLMcSTd0/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	125	2026-05-09 08:24:24.496253
128	2	-wfoRRFtE_8	คนรักกัน - I-ZAX【OFFICIAL MV】	https://i.ytimg.com/vi/-wfoRRFtE_8/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	126	2026-05-09 08:24:24.762064
129	2	Eez1RCmkius	ที่ปรึกษา : พดด้วง [Official MV]	https://i.ytimg.com/vi/Eez1RCmkius/mqdefault.jpg	\N	rsfriends	127	2026-05-09 08:24:25.020444
130	2	zM3fqerDNEM	ไม่แข่งยิ่งแพ้ - เบิร์ด ธงไชย【OFFICIAL MV】	https://i.ytimg.com/vi/zM3fqerDNEM/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	128	2026-05-09 08:24:25.285016
131	2	lVC6VE4Znu0	ฉันคิด - โตน โซฟา [Lyric VDO] [HD]	https://i.ytimg.com/vi/lVC6VE4Znu0/mqdefault.jpg	\N	Nithi Ekpathomsak	129	2026-05-09 08:24:25.544996
132	2	OdANlmfdUiA	เคยรักเธอหรือเปล่า  - โอ๋ ลำดวน	https://i.ytimg.com/vi/OdANlmfdUiA/mqdefault.jpg	\N	Kitty Pong	130	2026-05-09 08:24:25.960405
133	2	9TBfFLvDZto	เจ็บซ้ำซ้ำ - แอน  ธิติมา【OFFICIAL MV】	https://i.ytimg.com/vi/9TBfFLvDZto/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	131	2026-05-09 08:24:26.22116
134	2	I4rA9NTcBw0	ภาวนา -  โก้ เศกพล 【OFFICIAL MV】	https://i.ytimg.com/vi/I4rA9NTcBw0/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	132	2026-05-09 08:24:26.48686
135	2	SFj-hqjaDx8	จากวันที่เธอไม่อยู่ - พาย【OFFICIAL MV】	https://i.ytimg.com/vi/SFj-hqjaDx8/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	133	2026-05-09 08:24:26.745962
136	2	nF9DFghshSk	ใช่รักหรือเปล่า (Is This Love?) : Lydia [Official MV]	https://i.ytimg.com/vi/nF9DFghshSk/mqdefault.jpg	\N	rsfriends	134	2026-05-09 08:24:27.008722
137	2	zfJ5u2r4tQQ	เจ้าชายนิทรา - ETC【OFFICIAL MV】	https://i.ytimg.com/vi/zfJ5u2r4tQQ/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	135	2026-05-09 08:24:27.272981
138	2	077fwHRXoU4	ตัดใจ - VENUS【OFFICIAL MV】	https://i.ytimg.com/vi/077fwHRXoU4/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	136	2026-05-09 08:24:27.545014
139	2	dDqrnmCclBQ	หวังดีเสมอ - POTATO [เกิดทันตัวท็อป]	https://i.ytimg.com/vi/dDqrnmCclBQ/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	137	2026-05-09 08:24:27.820307
140	2	dib1UNPjwvs	ใกล้กันยิ่งหวั่นไหว - แนน วาทิยา【OFFICIAL MV】	https://i.ytimg.com/vi/dib1UNPjwvs/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	138	2026-05-09 08:24:28.08544
141	2	28K2d2slbi0	หยุดไม่ได้...ขาดใจ - อ๊อฟ ปองศักดิ์ 【OFFICIAL MV】	https://i.ytimg.com/vi/28K2d2slbi0/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	139	2026-05-09 08:24:28.347056
142	2	i1aOjDCPOsY	I'm Sorry - Ab normal【OFFICIAL MV】	https://i.ytimg.com/vi/i1aOjDCPOsY/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	140	2026-05-09 08:24:28.608917
143	2	m-dK4NbT7L4	TATTOO COLOUR - ฟ้า [Official MV]	https://i.ytimg.com/vi/m-dK4NbT7L4/mqdefault.jpg	\N	SMALLROOM	141	2026-05-09 08:24:28.868617
144	2	OKqFyWTMr0E	สายน้ำไม่ไหลกลับ - มาช่า วัฒนพานิช  【OFFICIAL MV】	https://i.ytimg.com/vi/OKqFyWTMr0E/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	142	2026-05-09 08:24:29.132245
145	2	G1ahTRfYdXc	ไม่เคยถาม - PEACEMAKER 【OFFICIAL MV】	https://i.ytimg.com/vi/G1ahTRfYdXc/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	143	2026-05-09 08:24:29.392332
146	2	bo9l6cI0qpY	คิดผิดใช่ไหม - โน้ต & ตูน【OFFICIAL MV】	https://i.ytimg.com/vi/bo9l6cI0qpY/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	144	2026-05-09 08:24:29.657175
147	2	w0-XirmCtio	กรุณาพูดดังๆ - ซีต้า ซาไลย์【OFFICIAL MV】	https://i.ytimg.com/vi/w0-XirmCtio/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	145	2026-05-09 08:24:29.916155
148	2	tFKL2nLzkhg	อยู่ดีดีก็อยากร้องไห้ - ตอง ภัครมัย 【OFFICIAL MV】	https://i.ytimg.com/vi/tFKL2nLzkhg/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	146	2026-05-09 08:24:30.181069
149	2	YZ86X-YKWlA	ที่คิดถึง...เพราะรักเธอใช่ไหม (Ost. สะใภ้ลูกทุ่ง) - โบว์ลิ่ง มานิดา【OFFICIAL MV】	https://i.ytimg.com/vi/YZ86X-YKWlA/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	147	2026-05-09 08:24:30.440109
150	2	rvAoD8boyYI	Singular - One (Official Music Video)	https://i.ytimg.com/vi/rvAoD8boyYI/mqdefault.jpg	\N	SingularVEVO	148	2026-05-09 08:24:30.70561
151	2	Vi8-8qahee4	เรื่องมหัศจรรย์ - SOFA【OFFICIAL MV】	https://i.ytimg.com/vi/Vi8-8qahee4/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	149	2026-05-09 08:24:30.966877
152	2	6L8bIpwtnhI	ไม่มีอีกแล้ว - โบ สุนิตา 【OFFICIAL MV】	https://i.ytimg.com/vi/6L8bIpwtnhI/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	150	2026-05-09 08:24:31.230812
153	2	_GO1RyWvG34	อย่าใกล้กันเลย - อ๊อฟ ปองศักดิ์【OFFICIAL MV】	https://i.ytimg.com/vi/_GO1RyWvG34/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	151	2026-05-09 08:24:31.51014
154	2	D4M4S95PB7c	ไม่มีใครแทนใครได้ - เอ็ม อรรถพล【OFFICIAL MV】	https://i.ytimg.com/vi/D4M4S95PB7c/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	152	2026-05-09 08:24:31.775123
155	2	fCLtIB7SjbQ	หรือแค่ขำขำ - เป๊ก ผลิตโชค【OFFICIAL MV】	https://i.ytimg.com/vi/fCLtIB7SjbQ/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	153	2026-05-09 08:24:32.033567
156	2	4LivNmCsxkE	วงกลม - บัวชมพู ฟอร์ด【OFFICIAL MV】	https://i.ytimg.com/vi/4LivNmCsxkE/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	154	2026-05-09 08:24:32.299336
157	2	pxIwHDy7epo	แพ้กลางคืน - Potato【OFFICIAL MV】	https://i.ytimg.com/vi/pxIwHDy7epo/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	155	2026-05-09 08:24:32.635228
158	2	17ezE33n4QY	ใจละเมอ : ปลื้ม [Official MV]	https://i.ytimg.com/vi/17ezE33n4QY/mqdefault.jpg	\N	rsfriends	156	2026-05-09 08:24:32.901858
159	2	K90RZ_EFW24	ค่อย ๆ รัก -  บี น้ำทิพย์【OFFICIAL MV】	https://i.ytimg.com/vi/K90RZ_EFW24/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	157	2026-05-09 08:24:33.17455
160	2	0SPsc22Pypo	Ben Chalatit - คนข้างล่าง [Official MV]	https://i.ytimg.com/vi/0SPsc22Pypo/mqdefault.jpg	\N	Bakery Music [ Official ]	158	2026-05-09 08:24:33.45499
161	2	c4kyotDzNn8	ปล่อยมือ - แอน ธิติมา 【OFFICIAL MV】	https://i.ytimg.com/vi/c4kyotDzNn8/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	159	2026-05-09 08:24:33.864482
162	2	6E8MMNl8yJE	ดอกไม้ในหัวใจ - ปนัดดา เรืองวุฒิ 【OFFICIAL MV】	https://i.ytimg.com/vi/6E8MMNl8yJE/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	160	2026-05-09 08:24:34.129083
163	2	lC3QkI-9CYk	ไม่อยากให้เธอไว้ใจ - มาช่า【OFFICIAL MV】	https://i.ytimg.com/vi/lC3QkI-9CYk/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	161	2026-05-09 08:24:34.388122
164	2	h-KbTlH__58	ซื้อกุหลาบให้ตัวเอง - Voice Male【OFFICIAL MV】	https://i.ytimg.com/vi/h-KbTlH__58/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	162	2026-05-09 08:24:34.653764
165	2	QrmhCO7Qlyk	คำถามที่ต้องตอบ - อ๊อฟ ปองศักดิ์【OFFICIAL MV】	https://i.ytimg.com/vi/QrmhCO7Qlyk/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	163	2026-05-09 08:24:34.913438
166	2	mGfhG5Cn5J8	จนกว่าวันนั้น : Lydia [Official MV]	https://i.ytimg.com/vi/mGfhG5Cn5J8/mqdefault.jpg	\N	rsfriends	164	2026-05-09 08:24:35.177881
167	2	-bVGCTb52gw	Mild - รักล้นใจ	https://i.ytimg.com/vi/-bVGCTb52gw/mqdefault.jpg	\N	bumepto	165	2026-05-09 08:24:36.533181
168	2	8lop0uOtfMA	แน่ใจว่ารัก (IT'S A) SURE THING - มิ้นท์ อรรถวดี【OFFICIAL MV】	https://i.ytimg.com/vi/8lop0uOtfMA/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	166	2026-05-09 08:24:36.795708
169	2	eJq-rHdMhqE	ของที่เธอไม่รัก - อ๊อฟ ปองศักดิ์【OFFICIAL MV】	https://i.ytimg.com/vi/eJq-rHdMhqE/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	167	2026-05-09 08:24:37.05447
170	2	QDBZ5FcVGRE	ตู่ ภพธร : สักเท่าไร [Official MV]	https://i.ytimg.com/vi/QDBZ5FcVGRE/mqdefault.jpg	\N	LOVEiS	168	2026-05-09 08:24:37.318027
171	2	o8ke5GxN0_s	Pause - ที่ว่าง  [Official MV]	https://i.ytimg.com/vi/o8ke5GxN0_s/mqdefault.jpg	\N	Bakery Music [ Official ]	169	2026-05-09 08:24:37.577533
172	2	tvRzAgw3d4U	Sassy Girl -  POTATO【OFFICIAL MV】	https://i.ytimg.com/vi/tvRzAgw3d4U/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	170	2026-05-09 08:24:37.841903
173	2	uTjmM1YYqnw	นอนไม่หลับ - ZA ZA 【OFFICIAL MV】	https://i.ytimg.com/vi/uTjmM1YYqnw/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	171	2026-05-09 08:24:38.102067
174	2	PAlIrl0E-hA	ฉันไม่มีเวทมนตร์(ละคร เจ้าแม่จำเป็น) - ตอง ภัครมัย【OFFICIAL MV】	https://i.ytimg.com/vi/PAlIrl0E-hA/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	172	2026-05-09 08:24:38.366974
175	2	w8m3s-TWz6s	คืนเดียวกัน - B.O.Y【OFFICIAL MV】	https://i.ytimg.com/vi/w8m3s-TWz6s/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	173	2026-05-09 08:24:38.625858
176	2	lYHYP33NdMI	เพื่อนเท่านั้น - Teen 8 Grade A 【OFFICIAL MV】	https://i.ytimg.com/vi/lYHYP33NdMI/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	174	2026-05-09 08:24:38.888816
177	2	icVi3bAPfTY	ทำไมต้องรักเธอ - เอิ้น feat.คริส, อุ๋ย	https://i.ytimg.com/vi/icVi3bAPfTY/mqdefault.jpg	\N	Sanamluang Music	175	2026-05-09 08:24:39.150507
178	2	GbbxkhtWX7g	STAMP : ครั้งสุดท้าย [Official MV]	https://i.ytimg.com/vi/GbbxkhtWX7g/mqdefault.jpg	\N	LOVEiS	176	2026-05-09 08:24:39.414626
179	2	WD3Z6_EqksI	ไม่มีเบอร์ 1 ถึง 2 คน -  Monkey Act 【OFFICIAL MV】	https://i.ytimg.com/vi/WD3Z6_EqksI/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	177	2026-05-09 08:24:39.674293
180	2	_SdRWt7847g	กลับมาได้ไหม - ไอซ์ ศรัณยู 【OFFICIAL MV】	https://i.ytimg.com/vi/_SdRWt7847g/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	178	2026-05-09 08:24:39.956107
181	2	YeGuhC61KjU	แฟนคนอื่น - มะลิ【OFFICIAL MV】	https://i.ytimg.com/vi/YeGuhC61KjU/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	179	2026-05-09 08:24:40.216725
182	2	YjV1zVC7tys	เธอคือส่วนที่ขาด - มอส ปฏิภาณ【OFFICIAL MV】	https://i.ytimg.com/vi/YjV1zVC7tys/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	180	2026-05-09 08:24:40.480092
183	2	tyO9JM_mGQA	When I Fall in Love OST. Sexphone คลื่นเหงา สาวข้างบ้าน : แมทธิว ดีน [Official MV]	https://i.ytimg.com/vi/tyO9JM_mGQA/mqdefault.jpg	\N	rsfriends	181	2026-05-09 08:24:40.742248
184	2	wwpRMY3UGA0	เสียงที่ไม่ได้ยิน : Sound Walker [Official MV]	https://i.ytimg.com/vi/wwpRMY3UGA0/mqdefault.jpg	\N	rsfriends	182	2026-05-09 08:24:41.007909
185	2	KvEyxFr65Ew	Aroma - บี พีระพัฒน์【OFFICIAL MV】	https://i.ytimg.com/vi/KvEyxFr65Ew/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	183	2026-05-09 08:24:41.267661
186	2	uXUuX_ZARHM	หมดหัวใจ - ปนัดดา เรืองวุฒิ 【OFFICIAL MV】	https://i.ytimg.com/vi/uXUuX_ZARHM/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	184	2026-05-09 08:24:41.533258
187	2	hxOZuukC5Gw	ก็พอ - เต็ม วุฒิสิทธิ์【OFFICIAL MV】	https://i.ytimg.com/vi/hxOZuukC5Gw/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	185	2026-05-09 08:24:41.792485
188	2	2w-QR1v3QGk	Boyd Kosiyabong - ใคร feat. Pod Moderndog [Official MV]	https://i.ytimg.com/vi/2w-QR1v3QGk/mqdefault.jpg	\N	Bakery Music [ Official ]	186	2026-05-09 08:24:42.056072
189	2	LZvrUuAdybo	เพิ่งรู้ว่ารักเธอ - พอล  ภัทรพล【OFFICIAL MV】	https://i.ytimg.com/vi/LZvrUuAdybo/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	187	2026-05-09 08:24:42.315286
190	2	MwMhRkDo2OE	ไม่ลืม - U.H.T. 【OFFICIAL MV】	https://i.ytimg.com/vi/MwMhRkDo2OE/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	188	2026-05-09 08:24:42.581138
191	2	GIp3GLtrLNI	หัวใจไม่ฟังเหตุผล - เอ็ม อรรถพล【OFFICIAL MV】	https://i.ytimg.com/vi/GIp3GLtrLNI/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	189	2026-05-09 08:24:42.839746
192	2	7G0PqEWCRQg	ถ้าในโลกนี้ไม่มี...  - Bell Supol【OFFICIAL MV】	https://i.ytimg.com/vi/7G0PqEWCRQg/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	190	2026-05-09 08:24:43.103938
193	2	GPZslDSIrm4	North Star - Calories Blah Blah [OFFICIAL AUDIO]	https://i.ytimg.com/vi/GPZslDSIrm4/mqdefault.jpg	\N	werkgang	191	2026-05-09 08:24:43.371766
194	2	UF9kPFHOZ8A	อยู่ได้ไหม - ลิซ่า เทเรซ่า & หวาน พิมรา 【OFFICIAL MV】	https://i.ytimg.com/vi/UF9kPFHOZ8A/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	192	2026-05-09 08:24:45.523602
195	2	u6hg-9T2lUY	เพราะเคืองฉัน - Quantum【OFFICIAL MV】	https://i.ytimg.com/vi/u6hg-9T2lUY/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	193	2026-05-09 08:24:45.950568
196	2	XnGOfnqtNkc	อย่าไปไหนอีกนะ - Calories Blah Blah【OFFICIAL MV】	https://i.ytimg.com/vi/XnGOfnqtNkc/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	194	2026-05-09 08:24:46.216401
197	2	bFhEHWDNdDk	Crescendo - ดินแดนแห่งความรัก [Official MV]	https://i.ytimg.com/vi/bFhEHWDNdDk/mqdefault.jpg	\N	Bakery Music [ Official ]	195	2026-05-09 08:24:46.481096
198	2	V7pr94DLgfc	[ MV ] CHAMP - เพลง : นอนน้อย	https://i.ytimg.com/vi/V7pr94DLgfc/mqdefault.jpg	\N	LOVEiS	196	2026-05-09 08:24:46.744672
199	2	DReFYSHQEYA	ชู้ ปี ดู วับ - POTATO 【OFFICIAL MV】	https://i.ytimg.com/vi/DReFYSHQEYA/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	197	2026-05-09 08:24:47.008508
200	2	YOrpmkE7wy8	นาทีเดียวในตอนสุดท้าย : JO-POP [Official MV]	https://i.ytimg.com/vi/YOrpmkE7wy8/mqdefault.jpg	\N	rsfriends	198	2026-05-09 08:24:47.266137
201	2	e8LVEzyptc4	ชู้ในใจ - เป๊ก ผลิตโชค【OFFICIAL MV】	https://i.ytimg.com/vi/e8LVEzyptc4/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	199	2026-05-09 08:24:47.529014
202	2	uJzaYR81dbE	ขอเป็นคนสุดท้าย : Subtention [Official MV]	https://i.ytimg.com/vi/uJzaYR81dbE/mqdefault.jpg	\N	rsfriends	200	2026-05-09 08:24:47.790261
203	1	Oe9T_dPUQPE	คืนข้ามปี - ดา เอ็นโดรฟิน【OFFICIAL MV】	https://i.ytimg.com/vi/Oe9T_dPUQPE/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	3	2026-05-09 10:34:57.49414
204	1	SXy-v1KbF4k	ฝนตกที่หน้าต่าง - LOSO 【OFFICIAL MV】	https://i.ytimg.com/vi/SXy-v1KbF4k/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	4	2026-05-09 10:35:24.319469
389	4	bAQw8ZS_0kg	เล่นของสูง - BIGASS【OFFICIAL MV】	https://i.ytimg.com/vi/bAQw8ZS_0kg/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	25	2026-05-09 12:19:42.104365
1758	19	MCJp-n1DpDM	Zach Top - South Of Sanity	https://i.ytimg.com/vi/MCJp-n1DpDM/mqdefault.jpg	\N	Zach Top	41	2026-06-01 00:26:26.070688
1759	19	7Qgi_vesu1c	Touch Me Like a Gangster	https://i.ytimg.com/vi/7Qgi_vesu1c/mqdefault.jpg	\N	Jessie Murph - Topic	42	2026-06-01 00:26:26.077122
1760	19	wxzrCaty_9M	Racewall Mosquitoes - Redneck Paths [Official Music Video]	https://i.ytimg.com/vi/wxzrCaty_9M/mqdefault.jpg	\N	Racewall Mosquitoes	43	2026-06-01 00:26:26.083102
1761	19	EJIwNQb6tWA	Morgan Wallen - Love Somebody (Audio)	https://i.ytimg.com/vi/EJIwNQb6tWA/mqdefault.jpg	\N	MorganWallenVEVO	44	2026-06-01 00:26:26.089425
1762	19	ljnVbNurQpk	Midland - Drinkin' Problem (Lyric Video)	https://i.ytimg.com/vi/ljnVbNurQpk/mqdefault.jpg	\N	MidlandVEVO	45	2026-06-01 00:26:26.095827
1763	19	8JYJJRxMOZs	Russell Dickerson - Happen To Me	https://i.ytimg.com/vi/8JYJJRxMOZs/mqdefault.jpg	\N	RusselledVEVO	46	2026-06-01 00:26:26.102146
1764	19	SzMu9Cf7xeQ	Zach Bryan - Say Why	https://i.ytimg.com/vi/SzMu9Cf7xeQ/mqdefault.jpg	\N	Zach Bryan	47	2026-06-01 00:26:26.108414
1765	19	LR43igounYU	Hudson Westbrook - Painted You Pretty (Visualizer)	https://i.ytimg.com/vi/LR43igounYU/mqdefault.jpg	\N	Hudson Westbrook	48	2026-06-01 00:26:26.114592
1766	19	3oeLxl3sjbk	Jason Aldean - How Far Does A Goodbye Go (Official Music Video)	https://i.ytimg.com/vi/3oeLxl3sjbk/mqdefault.jpg	\N	Jason Aldean	49	2026-06-01 00:26:26.120668
1767	19	2KN3V_SfXss	Brandon Sandefur "LYING DOWN" (Official Music Video)	https://i.ytimg.com/vi/2KN3V_SfXss/mqdefault.jpg	\N	Brandon Sandefur	50	2026-06-01 00:26:26.127003
1768	19	hRyxZfz8gPE	Hudson Westbrook - Sober (Official Music Video)	https://i.ytimg.com/vi/hRyxZfz8gPE/mqdefault.jpg	\N	Hudson Westbrook	51	2026-06-01 00:26:26.133807
1769	19	-N_ePHTtZS8	Bad As The Rest	https://i.ytimg.com/vi/-N_ePHTtZS8/mqdefault.jpg	\N	Jessie Murph - Topic	52	2026-06-01 00:26:26.161922
1770	19	b2kt7G7duTI	Bury My Bones	https://i.ytimg.com/vi/b2kt7G7duTI/mqdefault.jpg	\N	Whiskey Myers - Topic	53	2026-06-01 00:26:26.16843
1771	19	hkID6sQeMk4	Stone	https://i.ytimg.com/vi/hkID6sQeMk4/mqdefault.jpg	\N	Whiskey Myers - Topic	54	2026-06-01 00:26:26.174133
1772	19	6fqlVyl-ouM	Miami	https://i.ytimg.com/vi/6fqlVyl-ouM/mqdefault.jpg	\N	Morgan Wallen - Topic	55	2026-06-01 00:26:26.1802
1773	19	DJdGFZOjuR4	Somebody’s Problem	https://i.ytimg.com/vi/DJdGFZOjuR4/mqdefault.jpg	\N	Morgan Wallen - Topic	56	2026-06-01 00:26:26.186546
1774	19	TOBYj4WfunQ	Jessie Murph - Bad As The Rest (Official Visualizer)	https://i.ytimg.com/vi/TOBYj4WfunQ/mqdefault.jpg	\N	JessieMurphVEVO	57	2026-06-01 00:26:26.204783
1775	19	2U1Cn4ukKiI	HARDY - Favorite Country Song (Official Music Video)	https://i.ytimg.com/vi/2U1Cn4ukKiI/mqdefault.jpg	\N	HARDY	58	2026-06-01 00:26:26.212017
1776	19	PcIpyTFfeuo	Lainey Wilson - Somewhere Over Laredo (Official Music Video)	https://i.ytimg.com/vi/PcIpyTFfeuo/mqdefault.jpg	\N	Lainey Wilson	59	2026-06-01 00:26:26.218364
1777	19	q6mH0Z7LurE	Brooks & Dunn - Play Something Country (Live from CMA Fest 2025) ft. Lainey Wilson	https://i.ytimg.com/vi/q6mH0Z7LurE/mqdefault.jpg	\N	BrooksandDunnVEVO	60	2026-06-01 00:26:26.224518
1778	19	0qJkgTOgvAA	I Wrote The Book	https://i.ytimg.com/vi/0qJkgTOgvAA/mqdefault.jpg	\N	Morgan Wallen - Topic	61	2026-06-01 00:26:26.233392
1779	19	C3W8-XuVQHg	Drunk	https://i.ytimg.com/vi/C3W8-XuVQHg/mqdefault.jpg	\N	Kiokya Cruickshank - Topic	62	2026-06-01 00:26:26.239243
1780	19	UIjvqFjWVwk	Luke Bryan - Country Song Came On (Official Music Video)	https://i.ytimg.com/vi/UIjvqFjWVwk/mqdefault.jpg	\N	LukeBryanVEVO	63	2026-06-01 00:26:26.245474
1781	19	zs_my1MvwYU	After All The Bars Are Closed (Last Call Version)	https://i.ytimg.com/vi/zs_my1MvwYU/mqdefault.jpg	\N	Thomas Rhett - Topic	64	2026-06-01 00:26:26.251348
1782	19	i9VjTIryn6s	The Five Stairsteps - Come Back (Official Audio)	https://i.ytimg.com/vi/i9VjTIryn6s/mqdefault.jpg	\N	LegacyRecordingsVEVO	65	2026-06-01 00:26:26.257291
1783	19	SCMhRwppbQM	Kane Brown, Jelly Roll - Haunted (Official Music Video)	https://i.ytimg.com/vi/SCMhRwppbQM/mqdefault.jpg	\N	KaneBrownVEVO	66	2026-06-01 00:26:26.273696
1784	19	plbNzv3KvWs	Megan Moroney - Wish I Didn't (Official Video)	https://i.ytimg.com/vi/plbNzv3KvWs/mqdefault.jpg	\N	MeganMoroneyVEVO	67	2026-06-01 00:26:26.279684
1785	19	dXidJX9WHdQ	Bad As I Used To Be (From F1® The Movie)	https://i.ytimg.com/vi/dXidJX9WHdQ/mqdefault.jpg	\N	Chris Stapleton - Topic	68	2026-06-01 00:26:26.286362
1786	19	neFb708-A0Y	Ella Langley - Bottom Of Your Boots (Official Audio)	https://i.ytimg.com/vi/neFb708-A0Y/mqdefault.jpg	\N	EllaLangleyVEVO	69	2026-06-01 00:26:26.301772
1787	19	X7Hwiw8yLko	Jelly Roll - Thorns (Official Music Video)	https://i.ytimg.com/vi/X7Hwiw8yLko/mqdefault.jpg	\N	Jelly Roll	70	2026-06-01 00:26:26.308468
1788	19	Xs4NPWjIdC8	Sand In My Boots	https://i.ytimg.com/vi/Xs4NPWjIdC8/mqdefault.jpg	\N	Morgan Wallen - Topic	71	2026-06-01 00:26:26.314803
1789	19	Xp5M4mXR2xM	The Man That Came Back	https://i.ytimg.com/vi/Xp5M4mXR2xM/mqdefault.jpg	\N	Jessie Murph - Topic	72	2026-06-01 00:26:26.321399
1790	19	k2hlr_ddpG8	Megan Moroney - 6 Months Later (Official Video)	https://i.ytimg.com/vi/k2hlr_ddpG8/mqdefault.jpg	\N	MeganMoroneyVEVO	73	2026-06-01 00:26:26.327798
1791	19	oAvXPROD_3Q	Bar None	https://i.ytimg.com/vi/oAvXPROD_3Q/mqdefault.jpg	\N	Jordan Davis - Topic	74	2026-06-01 00:26:26.334084
1792	19	a956ddcV8Ok	Rainmaker	https://i.ytimg.com/vi/a956ddcV8Ok/mqdefault.jpg	\N	Payton Riley - Topic	75	2026-06-01 00:26:26.342083
1793	19	c4NJn7tF-Dg	Texas	https://i.ytimg.com/vi/c4NJn7tF-Dg/mqdefault.jpg	\N	Blake Shelton - Topic	76	2026-06-01 00:26:26.348469
1794	19	kBwRu1Xtug8	Man Made A Bar	https://i.ytimg.com/vi/kBwRu1Xtug8/mqdefault.jpg	\N	Morgan Wallen - Topic	77	2026-06-01 00:26:26.355489
1795	19	_kk5TT9UZ3w	Falling Apart	https://i.ytimg.com/vi/_kk5TT9UZ3w/mqdefault.jpg	\N	Morgan Wallen - Topic	78	2026-06-01 00:26:26.361453
1796	19	0NLDbLsC56g	Shaboozey, Myles Smith - Blink Twice (Official Video)	https://i.ytimg.com/vi/0NLDbLsC56g/mqdefault.jpg	\N	ShaboozeyVEVO	79	2026-06-01 00:26:26.367362
1797	19	pLsITXqs6IM	Turn This Truck Around	https://i.ytimg.com/vi/pLsITXqs6IM/mqdefault.jpg	\N	Jordan Davis - Topic	80	2026-06-01 00:26:26.373773
359	4	mxbwoFKq060	ด้วยความคิดถึง	https://i.ytimg.com/vi/mxbwoFKq060/mqdefault.jpg	\N	Drama Stream - Topic	1	2026-05-09 12:19:31.171543
360	4	0Cg5m27Yp-Y	พยายามกี่ครั้งก็ตามแต่...	https://i.ytimg.com/vi/0Cg5m27Yp-Y/mqdefault.jpg	\N	HANGMAN - Topic	2	2026-05-09 12:19:31.533216
361	4	NjwXTqXWHVI	เสียดายของ	https://i.ytimg.com/vi/NjwXTqXWHVI/mqdefault.jpg	\N	Basher - Topic	3	2026-05-09 12:19:31.803957
362	4	rXJcK2njoag	ข้าน้อยสมควรตาย	https://i.ytimg.com/vi/rXJcK2njoag/mqdefault.jpg	\N	Big Ass - Topic	4	2026-05-09 12:19:32.083055
363	4	Z0EFWVznI-s	ก่อนตาย	https://i.ytimg.com/vi/Z0EFWVznI-s/mqdefault.jpg	\N	Big Ass - Topic	5	2026-05-09 12:19:32.351481
364	4	H_yjrdLSvp0	แฟนเราหลายใจ	https://i.ytimg.com/vi/H_yjrdLSvp0/mqdefault.jpg	\N	Skooba - Topic	6	2026-05-09 12:19:32.631459
365	4	WA2WHTaBK5o	ปวดใจ	https://i.ytimg.com/vi/WA2WHTaBK5o/mqdefault.jpg	\N	I-Zax - Topic	7	2026-05-09 12:19:32.897884
366	4	X3ncEJ9ur-I	อกข้างซ้าย	https://i.ytimg.com/vi/X3ncEJ9ur-I/mqdefault.jpg	\N	Motif - Topic	8	2026-05-09 12:19:33.182149
367	4	mkVJyNWCHRc	เปลือง	https://i.ytimg.com/vi/mkVJyNWCHRc/mqdefault.jpg	\N	Girl - Topic	9	2026-05-09 12:19:35.285329
368	4	lLqacLK0LtE	เผลอ	https://i.ytimg.com/vi/lLqacLK0LtE/mqdefault.jpg	\N	Mr.Z - Topic	10	2026-05-09 12:19:35.560438
369	4	3Yc7S21GZe8	ผิดไหม - ฟาเรนไฮธ์【OFFICIAL MV】	https://i.ytimg.com/vi/3Yc7S21GZe8/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	11	2026-05-09 12:19:35.828362
370	4	hFHlIH5SDFE	สักวันฉันจะดีพอ	https://i.ytimg.com/vi/hFHlIH5SDFE/mqdefault.jpg	\N	Bodyslam - Topic	12	2026-05-09 12:19:36.293759
371	4	9JW3XZ-6bdQ	ส่งท้ายคนเก่าต้อนรับคนใหม่	https://i.ytimg.com/vi/9JW3XZ-6bdQ/mqdefault.jpg	\N	Big Ass - Topic	13	2026-05-09 12:19:36.588974
372	4	WuH1ezsEqd4	ฉันอยู่ตรงนี้	https://i.ytimg.com/vi/WuH1ezsEqd4/mqdefault.jpg	\N	Blackhead - Topic	14	2026-05-09 12:19:36.875997
373	4	iHt3nRm7Evg	หมากเกมนี้	https://i.ytimg.com/vi/iHt3nRm7Evg/mqdefault.jpg	\N	Inca - Topic	15	2026-05-09 12:19:37.150756
374	4	0RwYTly8_F8	ไว้ใจ	https://i.ytimg.com/vi/0RwYTly8_F8/mqdefault.jpg	\N	Nui Amphol - Topic	16	2026-05-09 12:19:37.522478
375	4	KJmD5nI_DhE	Chocolate	https://i.ytimg.com/vi/KJmD5nI_DhE/mqdefault.jpg	\N	HANGMAN - Topic	17	2026-05-09 12:19:37.802418
376	4	3Q2xxm-cbO0	ศรัทธา	https://i.ytimg.com/vi/3Q2xxm-cbO0/mqdefault.jpg	\N	หิน เหล็ก ไฟ - Topic	18	2026-05-09 12:19:38.144464
1543	15	Z-qjxO_ZJKM	สิ่งของ - KLEAR「Official MV」	https://i.ytimg.com/vi/Z-qjxO_ZJKM/mqdefault.jpg	\N	Genierock	1	2026-05-30 04:08:34.930059
378	5	VAmT5nPlsRo	ใจเย็น	https://i.ytimg.com/vi/VAmT5nPlsRo/mqdefault.jpg	\N	Pancake - Topic	1	2026-05-09 12:19:40.291508
379	4	-zxBfMbE4DY	เลี้ยงส่ง	https://i.ytimg.com/vi/-zxBfMbE4DY/mqdefault.jpg	\N	So Cool - Topic	20	2026-05-09 12:19:40.5224
380	5	OPUwzzYXgv0	โกหก	https://i.ytimg.com/vi/OPUwzzYXgv0/mqdefault.jpg	\N	Tattoo Colour - Topic	2	2026-05-09 12:19:40.557698
381	4	squnzmd-QX0	Bedroom Audio - รักมือสอง [Official Music Video]	https://i.ytimg.com/vi/squnzmd-QX0/mqdefault.jpg	\N	TERO MUSIC	21	2026-05-09 12:19:40.797179
382	5	Zq97x5424mI	Cinderella	https://i.ytimg.com/vi/Zq97x5424mI/mqdefault.jpg	\N	Tattoo Colour - Topic	3	2026-05-09 12:19:40.842753
383	4	VBTTFeKV1DM	กอด	https://i.ytimg.com/vi/VBTTFeKV1DM/mqdefault.jpg	\N	NOS - Topic	22	2026-05-09 12:19:41.103434
384	5	oP3oPhFn1gY	รักคนมีเจ้าของ	https://i.ytimg.com/vi/oP3oPhFn1gY/mqdefault.jpg	\N	I..Nam - Topic	4	2026-05-09 12:19:41.115683
385	4	qlZrwC5LOVU	แพ้ทาง	https://i.ytimg.com/vi/qlZrwC5LOVU/mqdefault.jpg	\N	Labanoon - Topic	23	2026-05-09 12:19:41.464464
386	5	Mhu36AxJi3w	Dancing	https://i.ytimg.com/vi/Mhu36AxJi3w/mqdefault.jpg	\N	Musketeers - Topic	5	2026-05-09 12:19:41.474117
387	4	gND2i78mfPw	ทำอะไรสักอย่าง	https://i.ytimg.com/vi/gND2i78mfPw/mqdefault.jpg	\N	Nakharin Kingsak - Topic	24	2026-05-09 12:19:41.825389
388	5	Gd1HqHso5IM	อยากให้เธอลอง	https://i.ytimg.com/vi/Gd1HqHso5IM/mqdefault.jpg	\N	Musketeers - Topic	6	2026-05-09 12:19:41.827896
390	5	5SZByn3eik0	ยินดีที่ไม่รู้จัก...	https://i.ytimg.com/vi/5SZByn3eik0/mqdefault.jpg	\N	25 hours - Topic	7	2026-05-09 12:19:42.107474
391	5	sbTbWRhAc28	ไม่เคย	https://i.ytimg.com/vi/sbTbWRhAc28/mqdefault.jpg	\N	25 hours - Topic	8	2026-05-09 12:19:42.544568
392	4	nKBrMYEbX_Y	อย่างน้อย	https://i.ytimg.com/vi/nKBrMYEbX_Y/mqdefault.jpg	\N	Big Ass - Topic	26	2026-05-09 12:19:42.546731
393	4	UZxDLz-li_c	Slot Machine: เคลิ้ม - KLOEM [Official Music Video]	https://i.ytimg.com/vi/UZxDLz-li_c/mqdefault.jpg	\N	TERO MUSIC	27	2026-05-09 12:19:42.854559
394	5	fRpSkYYekPY	คนไม่เอาถ่าน	https://i.ytimg.com/vi/fRpSkYYekPY/mqdefault.jpg	\N	Big Ass - Topic	9	2026-05-09 12:19:42.857164
395	4	SZ6p1Pe-2do	แสงสุดท้าย	https://i.ytimg.com/vi/SZ6p1Pe-2do/mqdefault.jpg	\N	Bodyslam - Topic	28	2026-05-09 12:19:43.131273
396	5	hFHlIH5SDFE	สักวันฉันจะดีพอ	https://i.ytimg.com/vi/hFHlIH5SDFE/mqdefault.jpg	\N	Bodyslam - Topic	10	2026-05-09 12:19:43.134525
397	4	Cuoop11CL74	น้ำลาย - Silly Fools 【OFFICIAL MV】	https://i.ytimg.com/vi/Cuoop11CL74/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	29	2026-05-09 12:19:43.404463
398	5	Z1sFbNEIfHg	ขี้หึง	https://i.ytimg.com/vi/Z1sFbNEIfHg/mqdefault.jpg	\N	Silly Fools - Topic	11	2026-05-09 12:19:43.413333
399	4	G9R8D1SRZ1Q	ที่เดิม - Potato【OFFICIAL MV】	https://i.ytimg.com/vi/G9R8D1SRZ1Q/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	30	2026-05-09 12:19:43.682519
400	5	_mJx3z9hCp8	เธอทั้งนั้น	https://i.ytimg.com/vi/_mJx3z9hCp8/mqdefault.jpg	\N	Groove Riders - Topic	12	2026-05-09 12:19:43.691391
401	4	R0LzjRqmZ8E	โรคประจำตัว - CLASH【OFFICIAL MV】	https://i.ytimg.com/vi/R0LzjRqmZ8E/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	31	2026-05-09 12:19:43.974108
402	5	qlZrwC5LOVU	แพ้ทาง	https://i.ytimg.com/vi/qlZrwC5LOVU/mqdefault.jpg	\N	Labanoon - Topic	13	2026-05-09 12:19:43.983243
403	4	1hOzfYC-YCI	จิ๊จ๊ะ - Silly Fools【OFFICIAL MV】	https://i.ytimg.com/vi/1hOzfYC-YCI/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	32	2026-05-09 12:19:44.248395
404	5	_-AYntUF9pM	คิดถึงฉันไหมเวลาที่เธอ...	https://i.ytimg.com/vi/_-AYntUF9pM/mqdefault.jpg	\N	Taxi - Topic	14	2026-05-09 12:19:44.259697
405	4	eVVnVPCA8sw	แมน - ป้าง นครินทร์ กิ่งศักดิ์【OFFICIAL MV】	https://i.ytimg.com/vi/eVVnVPCA8sw/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	33	2026-05-09 12:19:44.60332
406	5	Fgx8LUHDVak	โปรดส่งใครมารักฉันที	https://i.ytimg.com/vi/Fgx8LUHDVak/mqdefault.jpg	\N	Instinct - Topic	15	2026-05-09 12:19:44.615128
407	4	CMbYwYYFI3Y	Slot Machine - จันทร์เจ้า	https://i.ytimg.com/vi/CMbYwYYFI3Y/mqdefault.jpg	\N	slotmachineVEVO	34	2026-05-09 12:19:44.896979
408	5	hXz_hS68HJA	ผ่าน	https://i.ytimg.com/vi/hXz_hS68HJA/mqdefault.jpg	\N	Slot Machine - Topic	16	2026-05-09 12:19:44.899538
409	4	0kV9SffGLr4	สุขาอยู่หนใด	https://i.ytimg.com/vi/0kV9SffGLr4/mqdefault.jpg	\N	25 hours - Topic	35	2026-05-09 12:19:45.172642
410	5	IIU-GXND5YI	กลับมา (Remastered 2021)	https://i.ytimg.com/vi/IIU-GXND5YI/mqdefault.jpg	\N	2 Days Ago Kids - Topic	17	2026-05-09 12:19:45.184641
411	4	MkAuDTlOIAo	แรงโน้มถ่วง	https://i.ytimg.com/vi/MkAuDTlOIAo/mqdefault.jpg	\N	25 hours - Topic	36	2026-05-09 12:19:45.509559
412	5	_EqJapHgERI	สองรัก	https://i.ytimg.com/vi/_EqJapHgERI/mqdefault.jpg	\N	Zeal - Topic	18	2026-05-09 12:19:45.51768
413	4	nFxZGf6I5lc	คนที่ฆ่าฉัน - SILLY FOOLS【OFFICIAL MV】	https://i.ytimg.com/vi/nFxZGf6I5lc/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	37	2026-05-09 12:19:45.817719
414	5	ff7ao5s0heQ	ความเชื่อ	https://i.ytimg.com/vi/ff7ao5s0heQ/mqdefault.jpg	\N	Bodyslam - Topic	19	2026-05-09 12:19:45.826108
415	4	TNbSP0VfFWQ	คนไม่เอาถ่าน - Big Ass【OFFICIAL MV】	https://i.ytimg.com/vi/TNbSP0VfFWQ/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	38	2026-05-09 12:19:46.223875
416	5	vppFQ6i2sko	อย่างน้อย	https://i.ytimg.com/vi/vppFQ6i2sko/mqdefault.jpg	\N	Big Ass - Topic	20	2026-05-09 12:19:46.226206
417	5	PCmpeFoPzwY	ฤดูร้อน	https://i.ytimg.com/vi/PCmpeFoPzwY/mqdefault.jpg	\N	Paradox - Topic	21	2026-05-09 12:19:46.498738
418	4	pDmm1GEBgos	Hey Hey - TAXI【OFFICIAL MV】	https://i.ytimg.com/vi/pDmm1GEBgos/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	39	2026-05-09 12:19:46.501263
419	4	vkTcxeI1Q1M	ทางผ่าน	https://i.ytimg.com/vi/vkTcxeI1Q1M/mqdefault.jpg	\N	Big Ass - Topic	40	2026-05-09 12:19:46.769093
420	5	LdoTY3dYFb8	เลี้ยงส่ง	https://i.ytimg.com/vi/LdoTY3dYFb8/mqdefault.jpg	\N	So Cool - Topic	22	2026-05-09 12:19:46.772168
421	5	fPs9RstRy3M	น้ำลาย	https://i.ytimg.com/vi/fPs9RstRy3M/mqdefault.jpg	\N	Silly Fools - Topic	23	2026-05-09 12:19:47.044631
422	4	eeZQG86uhc8	ความลับในใจ - สิบล้อ【OFFICIAL MV】	https://i.ytimg.com/vi/eeZQG86uhc8/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	41	2026-05-09 12:19:47.047545
423	4	-GOG1yMWDak	พบเพื่อเพียงผ่าน	https://i.ytimg.com/vi/-GOG1yMWDak/mqdefault.jpg	\N	Zeal - Topic	42	2026-05-09 12:19:47.315652
424	5	EV4oRgsK2wM	อกหัก	https://i.ytimg.com/vi/EV4oRgsK2wM/mqdefault.jpg	\N	Bodyslam - Topic	24	2026-05-09 12:19:47.319817
425	4	9zLKSLfRegA	วันสบาย	https://i.ytimg.com/vi/9zLKSLfRegA/mqdefault.jpg	\N	Apirome - Topic	43	2026-05-09 12:19:47.75153
426	5	gnE2MK5SmD0	เคลิ้ม	https://i.ytimg.com/vi/gnE2MK5SmD0/mqdefault.jpg	\N	สล๊อต แมชชีน - Topic	25	2026-05-09 12:19:47.755554
427	4	8e7yZJzDZiA	เหตุผล - BLACKHEAD  【OFFICIAL MV】	https://i.ytimg.com/vi/8e7yZJzDZiA/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	44	2026-05-09 12:19:48.07309
428	5	vSdIbW9GS-M	เล่นของสูง	https://i.ytimg.com/vi/vSdIbW9GS-M/mqdefault.jpg	\N	Big Ass - Topic	26	2026-05-09 12:19:48.073844
429	5	3antIsUc6PM	วัดใจ	https://i.ytimg.com/vi/3antIsUc6PM/mqdefault.jpg	\N	Silly Fools - Topic	27	2026-05-09 12:19:48.351644
430	4	wTHXvw_uEeI	สิ่งที่ฉันเป็น - EBOLA [Official MV - Enlighten 2005]	https://i.ytimg.com/vi/wTHXvw_uEeI/mqdefault.jpg	\N	EbolaTV	45	2026-05-09 12:19:48.352437
431	4	2jEDs7UPDjw	ใจฉันอยู่กับเธอ - BLACKHEAD【OFFICIAL MV】	https://i.ytimg.com/vi/2jEDs7UPDjw/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	46	2026-05-09 12:19:48.684467
432	5	AVC2_skhZww	ยาพิษ	https://i.ytimg.com/vi/AVC2_skhZww/mqdefault.jpg	\N	Bodyslam - Topic	28	2026-05-09 12:19:48.68721
433	5	9Sxnj0Bx4Z0	จันทร์เจ้า (Goodbye)	https://i.ytimg.com/vi/9Sxnj0Bx4Z0/mqdefault.jpg	\N	Slot Machine - Topic	29	2026-05-09 12:19:48.959016
434	4	ot15K0cNJxI	หลงกล (Re-Mastered)	https://i.ytimg.com/vi/ot15K0cNJxI/mqdefault.jpg	\N	หิน เหล็ก ไฟ - Topic	47	2026-05-09 12:19:48.966771
435	4	0op1ktDaG4U	เรื่องขี้หมา	https://i.ytimg.com/vi/0op1ktDaG4U/mqdefault.jpg	\N	Y Not 7 - Topic	48	2026-05-09 12:19:49.401654
436	4	RFO5QyRJYRo	อิจฉา	https://i.ytimg.com/vi/RFO5QyRJYRo/mqdefault.jpg	\N	ศร - Topic	49	2026-05-09 12:19:49.683456
437	4	gGdUPFVVbes	แผลในใจ	https://i.ytimg.com/vi/gGdUPFVVbes/mqdefault.jpg	\N	Nui Amphol - Topic	50	2026-05-09 12:19:49.955284
438	4	SvrWEKAzJcE	ยิ่งใกล้ยิ่งเจ็บ	https://i.ytimg.com/vi/SvrWEKAzJcE/mqdefault.jpg	\N	Inca - Topic	51	2026-05-09 12:19:50.230235
439	4	JbRtwduP5xs	ภาพลวงตา	https://i.ytimg.com/vi/JbRtwduP5xs/mqdefault.jpg	\N	Da Endorphine - Topic	52	2026-05-09 12:19:50.498208
440	4	uOoDAiimVQA	แค่บางคำ	https://i.ytimg.com/vi/uOoDAiimVQA/mqdefault.jpg	\N	Musketeers - Topic	53	2026-05-09 12:19:50.936443
441	4	oP3oPhFn1gY	รักคนมีเจ้าของ	https://i.ytimg.com/vi/oP3oPhFn1gY/mqdefault.jpg	\N	I..Nam - Topic	54	2026-05-09 12:19:51.201543
442	4	pUsvTXHVEyU	กบ	https://i.ytimg.com/vi/pUsvTXHVEyU/mqdefault.jpg	\N	หวิว - Topic	55	2026-05-09 12:19:51.480225
443	4	Xt5SP-3Y_QE	ลืม	https://i.ytimg.com/vi/Xt5SP-3Y_QE/mqdefault.jpg	\N	ขอนแก่น - Topic	56	2026-05-09 12:19:51.746976
444	4	4TA5fBaw1v4	ซ่อนกลิ่น	https://i.ytimg.com/vi/4TA5fBaw1v4/mqdefault.jpg	\N	Palmy - Topic	57	2026-05-09 12:19:52.025907
445	4	mwex4c0ibh8	บอกตัวเอง (Feat.โป่ง หินเหล็กไฟ)	https://i.ytimg.com/vi/mwex4c0ibh8/mqdefault.jpg	\N	Room 39 - Topic	58	2026-05-09 12:19:52.294725
446	4	TYUlOztSOdY	ถูกที่ ผิดเวลา	https://i.ytimg.com/vi/TYUlOztSOdY/mqdefault.jpg	\N	Hobbit - Topic	59	2026-05-09 12:19:52.580004
447	4	YxLKf0GyHTI	ทำไมต้องรักเธอ	https://i.ytimg.com/vi/YxLKf0GyHTI/mqdefault.jpg	\N	Earn Piyada - Topic	60	2026-05-09 12:19:52.882893
448	4	5SZByn3eik0	ยินดีที่ไม่รู้จัก...	https://i.ytimg.com/vi/5SZByn3eik0/mqdefault.jpg	\N	25 hours - Topic	61	2026-05-09 12:19:53.167521
449	4	_J1R3Yv4qzI	หวั่นไหว	https://i.ytimg.com/vi/_J1R3Yv4qzI/mqdefault.jpg	\N	Bodyslam - Topic	62	2026-05-09 12:19:53.514243
450	4	y1O4-mEs3Ac	Sticker	https://i.ytimg.com/vi/y1O4-mEs3Ac/mqdefault.jpg	\N	Bodyslam - Topic	63	2026-05-09 12:19:53.804862
451	4	85kBBPfKvNM	เพ้อเจ้อ	https://i.ytimg.com/vi/85kBBPfKvNM/mqdefault.jpg	\N	Alarm9 - Topic	64	2026-05-09 12:19:54.084771
452	4	ff7ao5s0heQ	ความเชื่อ	https://i.ytimg.com/vi/ff7ao5s0heQ/mqdefault.jpg	\N	Bodyslam - Topic	65	2026-05-09 12:19:54.354903
453	4	81ti_N52kkE	เธอมีจริง	https://i.ytimg.com/vi/81ti_N52kkE/mqdefault.jpg	\N	Nakharin Kingsak - Topic	66	2026-05-09 12:19:54.636465
454	4	1Q4qS_FPphg	ถ้าฉันเป็นเขา	https://i.ytimg.com/vi/1Q4qS_FPphg/mqdefault.jpg	\N	Indigo - Topic	67	2026-05-09 12:19:54.903827
455	4	da0nnOkYVss	คืนที่ดาวเต็มฟ้า	https://i.ytimg.com/vi/da0nnOkYVss/mqdefault.jpg	\N	Pramote Vilepana - Topic	68	2026-05-09 12:19:55.181427
456	4	WCZXotMLV_c	เชือกวิเศษ	https://i.ytimg.com/vi/WCZXotMLV_c/mqdefault.jpg	\N	Labanoon - Topic	69	2026-05-09 12:19:55.448646
457	4	qKVmS1AmyUg	อย่าทำให้ฟ้าผิดหวัง	https://i.ytimg.com/vi/qKVmS1AmyUg/mqdefault.jpg	\N	Da Endorphine - Topic	70	2026-05-09 12:19:55.729947
458	4	vHE1RYjrW0s	ไม่รู้จักฉัน ไม่รู้จักเธอ	https://i.ytimg.com/vi/vHE1RYjrW0s/mqdefault.jpg	\N	Da Endorphine - Topic	71	2026-05-09 12:19:56.156999
459	6	QTOfqLw5B6M	รวมเพลงเพราะๆ ไว้ฟังเวลาตั้งแคมป์ 🎼 อินดี้โฟล์ค ฟังสบาย 🌳💚	https://i.ytimg.com/vi/QTOfqLw5B6M/mqdefault.jpg	\N	บทเพลงสายลมการเดินทาง	1	2026-05-09 17:55:29.979584
460	6	uTnPUGAJDJQ	ฤดูฝน	https://i.ytimg.com/vi/uTnPUGAJDJQ/mqdefault.jpg	\N	เขียนไขและวานิช - Topic	2	2026-05-09 17:55:29.989271
461	6	SNJS5fmycZM	ภาพฝันในจักรวาล	https://i.ytimg.com/vi/SNJS5fmycZM/mqdefault.jpg	\N	เขียนไขและวานิช - Topic	3	2026-05-09 17:55:29.994363
462	6	GsyDkjbP894	เผลอเพียงชั่วคราว	https://i.ytimg.com/vi/GsyDkjbP894/mqdefault.jpg	\N	เขียนไขและวานิช - Topic	4	2026-05-09 17:55:29.999503
463	6	DPKH1iAeTmc	เพื่อการเดินทาง	https://i.ytimg.com/vi/DPKH1iAeTmc/mqdefault.jpg	\N	เขียนไขและวานิช - Topic	5	2026-05-09 17:55:30.005424
464	6	4ZF2SKo8pds	ตี 1:35	https://i.ytimg.com/vi/4ZF2SKo8pds/mqdefault.jpg	\N	เขียนไขและวานิช - Topic	6	2026-05-09 17:55:30.010914
465	6	rFBO-MJbquo	หนีห่าง	https://i.ytimg.com/vi/rFBO-MJbquo/mqdefault.jpg	\N	เขียนไขและวานิช - Topic	7	2026-05-09 17:55:30.016274
466	6	hZ-iHfcw0SQ	แก้มน้องนางนั้นแดงกว่าใคร	https://i.ytimg.com/vi/hZ-iHfcw0SQ/mqdefault.jpg	\N	เขียนไขและวานิช - Topic	8	2026-05-09 17:55:30.021105
467	6	0ZtuYgeN-zI	หนีห่าง (cover เขียนไขและวานิช) - Single	https://i.ytimg.com/vi/0ZtuYgeN-zI/mqdefault.jpg	\N	จุลโหฬาร - Topic	9	2026-05-09 17:55:30.025964
468	6	aUcBuFQdtEs	ถวิล	https://i.ytimg.com/vi/aUcBuFQdtEs/mqdefault.jpg	\N	เขียนไขและวานิช - Topic	10	2026-05-09 17:55:30.031103
469	6	3h5tRt5eJjM	ผู้ถูกเลือกให้ผิดหวัง...	https://i.ytimg.com/vi/3h5tRt5eJjM/mqdefault.jpg	\N	เรนิษรา - Topic	11	2026-05-09 17:55:30.037293
470	6	KGc5kAPABV8	จากตรงนี้ที่ (เคย) สวยงาม (La La Bye)	https://i.ytimg.com/vi/KGc5kAPABV8/mqdefault.jpg	\N	AYLA's - Topic	12	2026-05-09 17:55:30.042074
471	6	fhQBOXXpcbU	Ror Mai Me Kam Nod Karn	https://i.ytimg.com/vi/fhQBOXXpcbU/mqdefault.jpg	\N	คณะขวัญใจ - Topic	13	2026-05-09 17:55:30.046954
472	6	U5dh-ZJXHOQ	ต่อไปนี้	https://i.ytimg.com/vi/U5dh-ZJXHOQ/mqdefault.jpg	\N	เขียนไขและวานิช - Topic	14	2026-05-09 17:55:30.051704
473	6	FQXGxokd-NY	Kun Keu Duang Jan Chan Si Kon Ba	https://i.ytimg.com/vi/FQXGxokd-NY/mqdefault.jpg	\N	คณะขวัญใจ - Topic	15	2026-05-09 17:55:30.056593
474	6	ENdobBPWoGw	แม่กำปอง (feat. เขียนไขและวานิช)	https://i.ytimg.com/vi/ENdobBPWoGw/mqdefault.jpg	\N	T_047 - Topic	16	2026-05-09 17:55:30.061159
475	6	W0b0F3ItvGg	หนีห่าง	https://i.ytimg.com/vi/W0b0F3ItvGg/mqdefault.jpg	\N	เขียนไขและวานิช - Topic	17	2026-05-09 17:55:30.065854
476	6	8R9L9QhruNE	อาจจะเพียง	https://i.ytimg.com/vi/8R9L9QhruNE/mqdefault.jpg	\N	เขียนไขและวานิช - Topic	18	2026-05-09 17:55:30.070758
477	6	LsK8_oHw7-o	I’m OK // Not OK (Headphones Version)	https://i.ytimg.com/vi/LsK8_oHw7-o/mqdefault.jpg	\N	Boydpod - Topic	19	2026-05-09 17:55:30.075943
478	6	5HPc1nzc0YM	ช่วงเวลาหนึ่ง	https://i.ytimg.com/vi/5HPc1nzc0YM/mqdefault.jpg	\N	สุขเสมอ - Topic	20	2026-05-09 17:55:30.082014
479	6	K_XiVNiAwf0	Loop (ฉันจึงวนกลับมา)	https://i.ytimg.com/vi/K_XiVNiAwf0/mqdefault.jpg	\N	ASIA7 - Topic	21	2026-05-09 17:55:30.087099
480	6	5fbE5SHuBaE	เซปโตวินาที (Zeptosecond)	https://i.ytimg.com/vi/5fbE5SHuBaE/mqdefault.jpg	\N	ASIA7 - Topic	22	2026-05-09 17:55:30.094453
481	6	Gtiae1Lm-4w	ห้องสี่มุมซ้าย	https://i.ytimg.com/vi/Gtiae1Lm-4w/mqdefault.jpg	\N	Palmy - Topic	23	2026-05-09 17:55:30.099565
482	6	i1LUU4R1hRM	บุญธรรม	https://i.ytimg.com/vi/i1LUU4R1hRM/mqdefault.jpg	\N	เขียนไขและวานิช - Topic	24	2026-05-09 17:55:30.104361
483	6	BM2lhFERGZY	บูเดอซ่า	https://i.ytimg.com/vi/BM2lhFERGZY/mqdefault.jpg	\N	เขียนไขและวานิช - Topic	25	2026-05-09 17:55:30.10956
484	6	MJQwNTuRht4	เดินทางไกล	https://i.ytimg.com/vi/MJQwNTuRht4/mqdefault.jpg	\N	เขียนไขและวานิช - Topic	26	2026-05-09 17:55:30.114349
485	6	1w0nsPwAdJE	ปีกแห่งความฝันหรือปีกแห่งความจริง	https://i.ytimg.com/vi/1w0nsPwAdJE/mqdefault.jpg	\N	เขียนไขและวานิช - Topic	27	2026-05-09 17:55:30.119587
486	6	9L0uLvzSndU	บอกลา	https://i.ytimg.com/vi/9L0uLvzSndU/mqdefault.jpg	\N	เขียนไขและวานิช - Topic	28	2026-05-09 17:55:30.12419
487	6	oJuIbcst9wo	คิดถึง	https://i.ytimg.com/vi/oJuIbcst9wo/mqdefault.jpg	\N	เขียนไขและวานิช - Topic	29	2026-05-09 17:55:30.128629
488	6	cWf4C8tZrrg	คำที่เกินจะกล่าว - วสันต์17 (Cover by ออร์แกน)	https://i.ytimg.com/vi/cWf4C8tZrrg/mqdefault.jpg	\N	Organ Like Studio	30	2026-05-09 17:55:30.133128
489	7	CisHO6zuT-Y	หล่นหายระหว่างทาง	https://i.ytimg.com/vi/CisHO6zuT-Y/mqdefault.jpg	\N	Phumin - Topic	1	2026-05-09 17:55:54.534159
490	7	uL-2zPIvTfw	โกดำ (Live Session)	https://i.ytimg.com/vi/uL-2zPIvTfw/mqdefault.jpg	\N	วสันต์17 - Topic	2	2026-05-09 17:55:54.540001
491	7	Osq_Obx6I8A	ความรู้ & ความจริง	https://i.ytimg.com/vi/Osq_Obx6I8A/mqdefault.jpg	\N	Boy Imagine - Topic	3	2026-05-09 17:55:54.545222
492	7	f-wtcJy29EI	เต็นท์ข้าง	https://i.ytimg.com/vi/f-wtcJy29EI/mqdefault.jpg	\N	ฮันเตอร์ - Topic	4	2026-05-09 17:55:54.54962
493	7	r-68SZCd8Ao	Lung Gep Kong Gao	https://i.ytimg.com/vi/r-68SZCd8Ao/mqdefault.jpg	\N	Pan Ar-rom - Topic	5	2026-05-09 17:55:54.55433
494	7	IlayFKphGvw	ก่อนลา (Live Session)	https://i.ytimg.com/vi/IlayFKphGvw/mqdefault.jpg	\N	วสันต์17 - Topic	6	2026-05-09 17:55:54.558854
495	7	PYp4V_gOGck	กาลครั้งนึง	https://i.ytimg.com/vi/PYp4V_gOGck/mqdefault.jpg	\N	JUNENOM - Topic	7	2026-05-09 17:55:54.563427
496	7	iNAnSYiiYnU	ดั่งชีวันพลันงดงามยามมีคุณ (feat. Saipan)	https://i.ytimg.com/vi/iNAnSYiiYnU/mqdefault.jpg	\N	พราหมณ์ มณีกุล - Topic	8	2026-05-09 17:55:54.568362
497	7	uLyBBCR4XVQ	กรุ่นกลิ่นโปรยลมฝนสาดส่งใส่ความเ...	https://i.ytimg.com/vi/uLyBBCR4XVQ/mqdefault.jpg	\N	ดวงดาว เดียวดาย - Topic	9	2026-05-09 17:55:54.573307
498	7	MdTGJ7s_3cg	เพลงที่สามจากซ้ายมือ	https://i.ytimg.com/vi/MdTGJ7s_3cg/mqdefault.jpg	\N	Release - Topic	10	2026-05-09 17:55:54.577757
499	7	dVah9r8QIMg	แก้มน้องนางนั้นแดงกว่าใคร	https://i.ytimg.com/vi/dVah9r8QIMg/mqdefault.jpg	\N	เขียนไขและวานิช - Topic	11	2026-05-09 17:55:54.582684
500	7	SujLJiwZ028	ขอคนใจ๋ดีเป็นเพื่อนปี้ซักคน	https://i.ytimg.com/vi/SujLJiwZ028/mqdefault.jpg	\N	Nanglen Group - วงนั่งเล่น	12	2026-05-09 17:55:54.587184
501	7	4Qz-6QwiCfo	Glong Ban Took Kwam Song Jam	https://i.ytimg.com/vi/4Qz-6QwiCfo/mqdefault.jpg	\N	Pan Ar-rom - Topic	13	2026-05-09 17:55:54.591535
502	7	Hda9N8sU4Gw	เพลง: บันทึกสีเขียว - เต้ I’m Jogging	https://i.ytimg.com/vi/Hda9N8sU4Gw/mqdefault.jpg	\N	Seum Channel	14	2026-05-09 17:55:54.596029
503	7	wm8lAKMMCho	จะพัก	https://i.ytimg.com/vi/wm8lAKMMCho/mqdefault.jpg	\N	เขียนไขและวานิช - Topic	15	2026-05-09 17:55:54.601141
504	7	Ulpu5pldZBM	ดอกไม้ในใจฉัน	https://i.ytimg.com/vi/Ulpu5pldZBM/mqdefault.jpg	\N	WARIN - Topic	16	2026-05-09 17:55:54.605806
505	7	oF2OXJk0uk0	ทิฆัมพร - คืนที่ฟ้าไม่มีดาว [Official Audio]	https://i.ytimg.com/vi/oF2OXJk0uk0/mqdefault.jpg	\N	ทิฆัมพร 	17	2026-05-09 17:55:54.610383
506	7	0N4zfepe6dg	ยังคงดอย	https://i.ytimg.com/vi/0N4zfepe6dg/mqdefault.jpg	\N	Singto Numchoke - Topic	18	2026-05-09 17:55:54.614777
507	7	A4_O1VLjXRE	เด็กน้อยนักเดินทาง	https://i.ytimg.com/vi/A4_O1VLjXRE/mqdefault.jpg	\N	I'm Jogging - Topic	19	2026-05-09 17:55:54.619795
508	7	x3-PTvOTWm0	เจ้าสาวทานตะวัน	https://i.ytimg.com/vi/x3-PTvOTWm0/mqdefault.jpg	\N	อาจินต์ - Topic	20	2026-05-09 17:55:54.624196
509	7	BuWwfh6VGIw	ความรัก , ตู้ปลา กับสุราหนึ่งป้าน	https://i.ytimg.com/vi/BuWwfh6VGIw/mqdefault.jpg	\N	Boy Imagine - Topic	21	2026-05-09 17:55:54.629123
510	7	XAURaLJv7FI	ฝากลมไปบอกแม่ดอกลำดวน	https://i.ytimg.com/vi/XAURaLJv7FI/mqdefault.jpg	\N	ทิฆัมพร - Topic	22	2026-05-09 17:55:54.634091
511	7	0UoYa01PEhk	กาลครั้งนึง	https://i.ytimg.com/vi/0UoYa01PEhk/mqdefault.jpg	\N	JUNENOM - Topic	23	2026-05-09 17:55:54.638767
512	7	dLXBvaeASUs	ใครงามเลิศในปฐพี	https://i.ytimg.com/vi/dLXBvaeASUs/mqdefault.jpg	\N	Phumin - Topic	24	2026-05-09 17:55:54.643438
513	7	FTPS22p2Ok8	อ้ายนี้ยังกอยอยู่	https://i.ytimg.com/vi/FTPS22p2Ok8/mqdefault.jpg	\N	เบื๊อก - Topic	25	2026-05-09 17:55:54.648436
514	7	gPyfJ9s3jB0	ฝากฟากฟ้า (feat. บันทึกของปิติ)	https://i.ytimg.com/vi/gPyfJ9s3jB0/mqdefault.jpg	\N	ธาดา - Topic	26	2026-05-09 17:55:54.653599
515	7	01R9uuWiBUI	ຕື່ນຈາກຝັນ (ตื่นจากฝัน) (feat. LALA)	https://i.ytimg.com/vi/01R9uuWiBUI/mqdefault.jpg	\N	Bay6ix - Topic	27	2026-05-09 17:55:54.65839
516	7	B1YMZeZRJgY	ถึงเรานั้นจะอยู่เเสนไกลเเต่ความค...	https://i.ytimg.com/vi/B1YMZeZRJgY/mqdefault.jpg	\N	ชีวรินท์ - Topic	28	2026-05-09 17:55:54.662853
517	7	fnsCxndkgKI	หากเวียนมาพบกันใหม่	https://i.ytimg.com/vi/fnsCxndkgKI/mqdefault.jpg	\N	Phumin - Topic	29	2026-05-09 17:55:54.667668
518	7	8Hm2Iu0UlYk	ปะแล๊ดปะแล่น Ft. เดอะเพอะ	https://i.ytimg.com/vi/8Hm2Iu0UlYk/mqdefault.jpg	\N	เบื๊อก - Topic	30	2026-05-09 17:55:54.672956
519	7	wXAwHGKBbfc	สุขใจเมื่อได้เจอเธอ	https://i.ytimg.com/vi/wXAwHGKBbfc/mqdefault.jpg	\N	ธรรมรัฐ - Topic	31	2026-05-09 17:55:54.677918
520	7	8tb6m-X2g20	ก่อนลา	https://i.ytimg.com/vi/8tb6m-X2g20/mqdefault.jpg	\N	วสันต์17 - Topic	32	2026-05-09 17:55:54.682865
521	7	weIdA6CS6Rc	กี่วันแล้วหนอ	https://i.ytimg.com/vi/weIdA6CS6Rc/mqdefault.jpg	\N	เพ-ลา - Topic	33	2026-05-09 17:55:54.687645
522	7	O1lP0FFZAR8	28 (ยี่สิบแปด)	https://i.ytimg.com/vi/O1lP0FFZAR8/mqdefault.jpg	\N	Mr'พระจันทร์ - Topic	34	2026-05-09 17:55:54.692002
523	7	_KWehX06Gsc	เราไม่ใช่ส่วนเกิน - Phumin [OFFICIAL MUSIC]	https://i.ytimg.com/vi/_KWehX06Gsc/mqdefault.jpg	\N	Phumin [ Official ]	35	2026-05-09 17:55:54.696999
524	7	qTKvAfem674	เราไม่ใช่ส่วนเกิน	https://i.ytimg.com/vi/qTKvAfem674/mqdefault.jpg	\N	Phumin - Topic	36	2026-05-09 17:55:54.702136
525	7	lyG7seGDkE0	อยากให้ลองฟัง	https://i.ytimg.com/vi/lyG7seGDkE0/mqdefault.jpg	\N	Phumin - Topic	37	2026-05-09 17:55:54.70683
526	7	q_zHnuLjK_g	เขียนไขและวานิช - เพื่อการเดินทาง (Official Video)	https://i.ytimg.com/vi/q_zHnuLjK_g/mqdefault.jpg	\N	เขียนไขและวานิช	38	2026-05-09 17:55:54.711664
527	7	KiNqXvMVcn4	เธอทิ้งฉันเอาไว้ในบทเพลงเพลงนั้นที่เธอชอบเปิดฟังทุกวันตอนเรายังมีกัน - ดวงดาว เดียวดาย	https://i.ytimg.com/vi/KiNqXvMVcn4/mqdefault.jpg	\N	ดวงดาว เดียวดาย	39	2026-05-09 17:55:54.7156
528	7	TSgReeG82-s	ไม่มีพรุ่งนี้ไว้รอใคร - Phumin [AUDIO OFFICIAL]	https://i.ytimg.com/vi/TSgReeG82-s/mqdefault.jpg	\N	Phumin [ Official ]	40	2026-05-09 17:55:54.719939
529	7	KfPHXDObLDc	ออกเดินทาง - วงสวัสดี Acoustic live Session	https://i.ytimg.com/vi/KfPHXDObLDc/mqdefault.jpg	\N	วง สวัสดี	41	2026-05-09 17:55:54.724141
530	7	Sh9YXIodkbY	PORZAX - เธอเก่งที่สุดแล้ว	https://i.ytimg.com/vi/Sh9YXIodkbY/mqdefault.jpg	\N	PORZAX	42	2026-05-09 17:55:54.728088
531	8	yq8cs4Ni3DA	[1 hr] Playlist เพลงบรรเลงไทยแจ๊ส เปิดฟังสบายๆ คลอไว้ในร้านกาแฟ | Coffee & Smooth Jazz BGM	https://i.ytimg.com/vi/yq8cs4Ni3DA/mqdefault.jpg	\N	GMM สบาย สบาย	1	2026-05-09 17:58:05.704217
532	8	tcUzBbNTDls	[1 hr] Playlist ดนตรีบรรเลง เพลงเพราะๆ เปิดคลอๆ ในคาเฟ่ | Coffee & Bossa Nova BGM	https://i.ytimg.com/vi/tcUzBbNTDls/mqdefault.jpg	\N	GMM สบาย สบาย	2	2026-05-09 17:58:05.723614
533	8	_4kUuQndBR4	ดนตรีบรรเลงร้านกาแฟ เพลงไทยเปิดคลอๆในคาเฟ่ | Thai Cafe Jazz Playlist	https://i.ytimg.com/vi/_4kUuQndBR4/mqdefault.jpg	\N	GMM สบาย สบาย	3	2026-05-09 17:58:05.72882
534	8	C7CDg-tMVXk	ดนตรีบรรเลง เพลงร้านกาแฟฟังเพลินๆ #ฟังเพลงออนไลน์  | Café BGM Playlist	https://i.ytimg.com/vi/C7CDg-tMVXk/mqdefault.jpg	\N	GMM สบาย สบาย	4	2026-05-09 17:58:05.733858
535	8	a6aUv49JUJk	ดนตรีบรรเลง เปิดเพลงสร้างฟีลในร้านกาแฟ | Café Music Playlist	https://i.ytimg.com/vi/a6aUv49JUJk/mqdefault.jpg	\N	GMM สบาย สบาย	5	2026-05-09 17:58:05.739221
536	8	fzdR6wx1GFI	รวมเพลงบรรเลงเพราะๆ เปิดคลอในคาเฟ่ ฟังยาวๆ เพราะมากๆ #LONGPLAY	https://i.ytimg.com/vi/fzdR6wx1GFI/mqdefault.jpg	\N	GMM สบาย สบาย	6	2026-05-09 17:58:05.745521
537	8	87PU66qzaak	รวมเพลงรักรุ่นเก่า ฟังเพลินๆ | แจ๊สไทยบรรเลง [LONGPLAY]	https://i.ytimg.com/vi/87PU66qzaak/mqdefault.jpg	\N	GMM สบาย สบาย	7	2026-05-09 17:58:05.750084
538	8	XlHr347xPU4	แจ๊สบรรเลงเพราะๆ เปิดคลอไว้ในคาเฟ่ | Coffee Jazz Music #LONGPLAY	https://i.ytimg.com/vi/XlHr347xPU4/mqdefault.jpg	\N	GMM สบาย สบาย	8	2026-05-09 17:58:05.755411
539	8	h80JicyqeQY	ฟังเพลงเก่าเพราะๆ ฟังไป จิบกาแฟไป | Thai Songs for Café	https://i.ytimg.com/vi/h80JicyqeQY/mqdefault.jpg	\N	GMM สบาย สบาย	9	2026-05-09 17:58:05.760163
540	8	nT_v4992M0Y	ดนตรีฟังสบายๆ ในร้านกาแฟ | Smooth Jazz | Bossa Cafe Music	https://i.ytimg.com/vi/nT_v4992M0Y/mqdefault.jpg	\N	GMM สบาย สบาย	10	2026-05-09 17:58:05.76522
541	8	ZQSD7roU5Oo	เพลงบรรเลงเพราะๆ ฟังผ่อนคลาย เปิดไว้ตอนชงชา | Matcha Cafe BGM Playlist	https://i.ytimg.com/vi/ZQSD7roU5Oo/mqdefault.jpg	\N	GMM สบาย สบาย	11	2026-05-09 17:58:05.769668
542	8	bJq40C-Cz3E	#ฟังเพลงออนไลน์ เปิดคลอไว้ในร้านกาแฟ | Café Music BGM Playlist	https://i.ytimg.com/vi/bJq40C-Cz3E/mqdefault.jpg	\N	GMM สบาย สบาย	12	2026-05-09 17:58:05.774616
543	8	hOfbEoRa01o	ดนตรีสบายๆ เพลงบรรเลงเพราะๆ ฟังออนไลน์ ฟังยาวต่อเนื่อง #lofijazz	https://i.ytimg.com/vi/hOfbEoRa01o/mqdefault.jpg	\N	GMM สบาย สบาย	13	2026-05-09 17:58:05.779825
544	8	ak3SUfoBLFE	แจ๊สบรรเลง เพลงหวานในร้านกาแฟ | Café and Jazz Playlist	https://i.ytimg.com/vi/ak3SUfoBLFE/mqdefault.jpg	\N	GMM สบาย สบาย	14	2026-05-09 17:58:05.784579
545	8	-4qgETlfgWA	ดนตรีบรรเลงเพราะๆ รวมเพลงรัก ฟังสบายๆ | Romantic Love Songs	https://i.ytimg.com/vi/-4qgETlfgWA/mqdefault.jpg	\N	GMM สบาย สบาย	15	2026-05-09 17:58:05.78864
546	8	7-Uv_YH0YGE	เพลงฟังสบาย 2025 เพลงบรรเลงเพราะๆ ฟังสบายๆ ฟังยาวต่อเนื่อง	https://i.ytimg.com/vi/7-Uv_YH0YGE/mqdefault.jpg	\N	GMM สบาย สบาย	16	2026-05-09 17:58:05.793372
547	8	8bv3a2Yx3tM	ดนตรีร้านกาแฟ เพลงบรรเลงเพราะๆ ฟังสบายๆ ฟังยาวต่อเนื่อง #LONGPLAY	https://i.ytimg.com/vi/8bv3a2Yx3tM/mqdefault.jpg	\N	GMM สบาย สบาย	17	2026-05-09 17:58:05.798206
548	8	Hh-jxXGtcTk	เพลงผ่อนคลาย จิบกาแฟฟังเพลินๆ | Coffee Chill Mood BGM	https://i.ytimg.com/vi/Hh-jxXGtcTk/mqdefault.jpg	\N	GMM สบาย สบาย	18	2026-05-09 17:58:05.803504
549	8	Jwl_fGAL1kY	เพลงรักอารมณ์ดี เปิดฟังตอนนั่งจิบกาแฟ | Coffee Break Love Songs	https://i.ytimg.com/vi/Jwl_fGAL1kY/mqdefault.jpg	\N	GMM สบาย สบาย	19	2026-05-09 17:58:05.808321
550	8	w_oivuvRuGo	เพลงไทยสไตล์บอสซ่า เปิดคลอไว้ในร้านกาแฟ | Bossa Nova & Coffee Music	https://i.ytimg.com/vi/w_oivuvRuGo/mqdefault.jpg	\N	GMM สบาย สบาย	20	2026-05-09 17:58:05.813387
551	8	F44uRVRMRuU	ดนตรีบรรเลงเพราะๆ จิบกาแฟชิลๆ ฟังเพลงเพลินๆ | Thai Bossa Cafe Music	https://i.ytimg.com/vi/F44uRVRMRuU/mqdefault.jpg	\N	GMM สบาย สบาย	21	2026-05-09 17:58:05.818226
552	8	YzlYvUcTo0U	มื้อเช้า.. ฟังพลงชิล | Bossa & Breakfast | Morning Playlist	https://i.ytimg.com/vi/YzlYvUcTo0U/mqdefault.jpg	\N	GMM สบาย สบาย	22	2026-05-09 17:58:05.82298
553	8	q7qGTML8CoQ	เพลงเพราะร้านกาแฟ ฟังเพลินๆ เปิดได้ทั้งวัน | Lo-Fi Cafe Playlist	https://i.ytimg.com/vi/q7qGTML8CoQ/mqdefault.jpg	\N	GMM สบาย สบาย	23	2026-05-09 17:58:05.827935
554	8	aFbsylQCzCo	เปียโนฟังเพลินๆ เปิดคลอตอนจิบกาแฟ | Piano Cafe Music	https://i.ytimg.com/vi/aFbsylQCzCo/mqdefault.jpg	\N	GMM สบาย สบาย	24	2026-05-09 17:58:05.83314
555	8	IwpILPG8wb4	#บอสซาโนว่า พักใจจิบชา ฟังเพลินหน้าหนาว | Bossa & Tea Break Music	https://i.ytimg.com/vi/IwpILPG8wb4/mqdefault.jpg	\N	GMM สบาย สบาย	25	2026-05-09 17:58:05.838081
556	8	efWnO4bYAHs	รวมเพลงเพราะ ฟังเพลินใจ | Thai Lo-Fi Chill Music	https://i.ytimg.com/vi/efWnO4bYAHs/mqdefault.jpg	\N	GMM สบาย สบาย	26	2026-05-09 17:58:05.843502
557	8	ATjTkQRrl9Y	#แจ๊สบรรเลง เพลงหวานฟังในร้านกาแฟ | Coffee Jazz Love Songs	https://i.ytimg.com/vi/ATjTkQRrl9Y/mqdefault.jpg	\N	GMM สบาย สบาย	27	2026-05-09 17:58:05.848761
558	8	Qcf__C6a9fU	เพลงร้านกาแฟ ฟังเพลิน ฟีลดี | Jazzy Coffee Playlist	https://i.ytimg.com/vi/Qcf__C6a9fU/mqdefault.jpg	\N	GMM สบาย สบาย	28	2026-05-09 17:58:05.853998
559	8	55FuZB58sZc	เพลงเพราะรับลมหนาว อารมณ์ดี  | Feel Good Playlist	https://i.ytimg.com/vi/55FuZB58sZc/mqdefault.jpg	\N	GMM สบาย สบาย	29	2026-05-09 17:58:05.859355
560	8	FV-TW-1LfXE	เพลงเพราะฟังชิล ฟีลนั่งทำงานในร้านกาแฟ	https://i.ytimg.com/vi/FV-TW-1LfXE/mqdefault.jpg	\N	GMM สบาย สบาย	30	2026-05-09 17:58:05.864526
561	8	TiVvPi0MP2k	ดนตรีแจ๊ส จิบชายามบ่ายฟังสบายใจ | Smooth Jazz and Chill	https://i.ytimg.com/vi/TiVvPi0MP2k/mqdefault.jpg	\N	GMM สบาย สบาย	31	2026-05-09 17:58:05.869493
562	8	qXaXVX7NP10	เพลงชิลช่วยฮีลใจ ฟังตอนบ่าย จิบกาแฟ | Afternoon Jazz Playlist	https://i.ytimg.com/vi/qXaXVX7NP10/mqdefault.jpg	\N	GMM สบาย สบาย	32	2026-05-09 17:58:05.874688
563	8	hGqpaLMY2iQ	#เพลงเพราะๆ เปิดคลอ ในคาเฟ่ | THAI CAFÉ BGM	https://i.ytimg.com/vi/hGqpaLMY2iQ/mqdefault.jpg	\N	GMM สบาย สบาย	33	2026-05-09 17:58:05.879617
564	8	6nfsVJHV6mI	เปิดเพลงเพราะ ฟังแล้วอารมณ์ดี | Christmas Chill Music	https://i.ytimg.com/vi/6nfsVJHV6mI/mqdefault.jpg	\N	GMM สบาย สบาย	34	2026-05-09 17:58:05.884867
565	8	Jhr7wxY_I8U	ดนตรีบรรเลงร้านกาแฟ เพลงฟังง่าย สบายหู | Christmas Jazz	https://i.ytimg.com/vi/Jhr7wxY_I8U/mqdefault.jpg	\N	GMM สบาย สบาย	35	2026-05-09 17:58:05.88938
566	8	5hDgPOyOFrU	#ดนตรีบรรเลง | ฟังเพลงเพลินๆ ในร้านกาแฟ	https://i.ytimg.com/vi/5hDgPOyOFrU/mqdefault.jpg	\N	GMM สบาย สบาย	36	2026-05-09 17:58:05.896407
567	8	dglyAxno5bc	ดนตรีฟังสบาย ฟังตอนบ่าย จิบกาแฟ | Afternoon Chill Music	https://i.ytimg.com/vi/dglyAxno5bc/mqdefault.jpg	\N	GMM สบาย สบาย	37	2026-05-09 17:58:05.901914
568	8	Ru4OS-AaaA8	เพลงไทย ฟังสบายในคาเฟ่ | THAI CAFÉ BGM	https://i.ytimg.com/vi/Ru4OS-AaaA8/mqdefault.jpg	\N	GMM สบาย สบาย	38	2026-05-09 17:58:05.907063
569	8	S3XwxEk42nI	บอสซ่าเพลงไทย ฟังสบายในร้านกาแฟ | Bossa Nova & Coffee Playlist	https://i.ytimg.com/vi/S3XwxEk42nI/mqdefault.jpg	\N	GMM สบาย สบาย	39	2026-05-09 17:58:05.91169
570	8	gG629WezoEI	#bossacafejazz | เพลงชิลยามบ่าย สายกาแฟ ฟังเพลินๆ	https://i.ytimg.com/vi/gG629WezoEI/mqdefault.jpg	\N	GMM สบาย สบาย	40	2026-05-09 17:58:05.916466
571	8	l9UCkVhg3Bc	#เพลงร้านกาแฟ | ดนตรีช้าๆ ไว้ฟังชิลๆ	https://i.ytimg.com/vi/l9UCkVhg3Bc/mqdefault.jpg	\N	GMM สบาย สบาย	41	2026-05-09 17:58:05.920588
572	8	2YpGXKqAHA4	เพลงจิบชาฟังเพลินๆ | Bossa Nova & Tea Playlist	https://i.ytimg.com/vi/2YpGXKqAHA4/mqdefault.jpg	\N	GMM สบาย สบาย	42	2026-05-09 17:58:05.92544
573	8	x08fNgD1BFo	#acousticguitar | ฟังยามบ่าย สายกาแฟ	https://i.ytimg.com/vi/x08fNgD1BFo/mqdefault.jpg	\N	GMM สบาย สบาย	43	2026-05-09 17:58:05.935261
574	8	gGZ1q5vUkBk	#bossacafejazz | บอสซาโนว่า เพลงไทยฟังสบายหู	https://i.ytimg.com/vi/gGZ1q5vUkBk/mqdefault.jpg	\N	GMM สบาย สบาย	44	2026-05-09 17:58:05.941124
575	8	S6lpvgxUCws	#dripcoffee Playlist | เพลงผ่อนคลาย ฟังไปตอนดริปกาแฟ	https://i.ytimg.com/vi/S6lpvgxUCws/mqdefault.jpg	\N	GMM สบาย สบาย	45	2026-05-09 17:58:05.946631
576	8	LjHOgIzqkAI	#cafejazz | ดนตรีร้านกาแฟ ปล่อยใจฟังไปเพลินๆ	https://i.ytimg.com/vi/LjHOgIzqkAI/mqdefault.jpg	\N	GMM สบาย สบาย	46	2026-05-09 17:58:05.952136
577	8	YUJBMYp-TW0	Afternoon Coffee Jazz | จิบกาแฟยามบ่าย ฟังเพลงสบายๆ ผ่อนคลายมาก	https://i.ytimg.com/vi/YUJBMYp-TW0/mqdefault.jpg	\N	GMM สบาย สบาย	47	2026-05-09 17:58:05.956881
694	9	hDJ-4NAYr9s	DXRIW - เส้นขอบฟ้า(Skyline) Feat. Z9 , ARTIST [Official MV]	https://i.ytimg.com/vi/hDJ-4NAYr9s/mqdefault.jpg	\N	DXRIW	22	2026-05-10 12:31:54.804533
578	8	meD1lnWCqXs	รวมเพลงบอสซ่า ฟังเพลินตอนจิบชา | Tea & Bossa Nova Music	https://i.ytimg.com/vi/meD1lnWCqXs/mqdefault.jpg	\N	GMM สบาย สบาย	48	2026-05-09 17:58:05.961883
579	8	8I82l1uj6HQ	Cafe Jazz Longplay | ดนตรีบรรเลง เปิดคลอไว้ในร้านกาแฟ ฟังยาวต่อเนื่อง	https://i.ytimg.com/vi/8I82l1uj6HQ/mqdefault.jpg	\N	GMM สบาย สบาย	49	2026-05-09 17:58:05.967032
580	8	7MUH6A1HmXg	เปิดฟังระหว่างทำกาแฟ | COFFEE & JAZZ PLAYLIST	https://i.ytimg.com/vi/7MUH6A1HmXg/mqdefault.jpg	\N	GMM สบาย สบาย	50	2026-05-09 17:58:05.97325
581	8	cCIoWw66P0M	เพลงชิลฟังยามเช้า | BREAKFAST & JAZZ	https://i.ytimg.com/vi/cCIoWw66P0M/mqdefault.jpg	\N	GMM สบาย สบาย	51	2026-05-09 17:58:05.978939
582	8	1a12DY7AFP4	เปิดฟังระหว่างอ่าน | Book & Jazz Playlist	https://i.ytimg.com/vi/1a12DY7AFP4/mqdefault.jpg	\N	GMM สบาย สบาย	52	2026-05-09 17:58:05.984576
583	8	KpGuGK7M0fw	ดนตรีบรรเลง เพลงฟังสบาย สไตล์ร้านกาแฟ	https://i.ytimg.com/vi/KpGuGK7M0fw/mqdefault.jpg	\N	GMM สบาย สบาย	53	2026-05-09 17:58:05.98992
584	8	haGqEbuT9xY	[CAFE MUSIC] เพลงฟังสบาย ในเวลากาแฟ | Coffee Lounge Music	https://i.ytimg.com/vi/haGqEbuT9xY/mqdefault.jpg	\N	GMM สบาย สบาย	54	2026-05-09 17:58:05.995381
585	8	hums3Fo2raQ	[LONGPLAY] Coffee and Chill Music | ดนตรีบรรเลง เพลงร้านกาแฟ ฟังสบาย	https://i.ytimg.com/vi/hums3Fo2raQ/mqdefault.jpg	\N	GMM สบาย สบาย	55	2026-05-09 17:58:06.000668
586	8	mCCezskVzXM	[LONGPLAY] จิบกาแฟ ฟังเพลงเพราะ | Coffee and Cozy Music	https://i.ytimg.com/vi/mCCezskVzXM/mqdefault.jpg	\N	GMM สบาย สบาย	56	2026-05-09 17:58:06.005881
587	8	ZhWdaww5h-c	[PLAYLIST] เพลงบรรเลงร้านกาแฟ ฟังสบาย | Coffee Shop Music	https://i.ytimg.com/vi/ZhWdaww5h-c/mqdefault.jpg	\N	GMM สบาย สบาย	57	2026-05-09 17:58:06.01073
588	8	__qQI-MoIqs	Good Morning! 쌀쌀한 날씨와 함께하는 달콤한 가을 아침 재즈 피아노 모음 🍂	https://i.ytimg.com/vi/__qQI-MoIqs/mqdefault.jpg	\N	Music Ch'aewŏn	58	2026-05-09 17:58:06.016109
589	8	oyeTYUrxD-8	Cafe Playlist | ดนตรีบรรเลง เพลงร้านกาแฟ ฟังเพลินสบายๆ	https://i.ytimg.com/vi/oyeTYUrxD-8/mqdefault.jpg	\N	GMM สบาย สบาย	59	2026-05-09 17:58:06.020923
590	8	7aTeZFvzruw	[CAFE MUSIC] COFFEE JAZZ MOOD | เพลงบรรเลงร้านกาแฟ ฟังสบาย [ลม,ไม่เคย,คิดถึง]	https://i.ytimg.com/vi/7aTeZFvzruw/mqdefault.jpg	\N	GMM สบาย สบาย	60	2026-05-09 17:58:06.026167
591	8	Vr2u_DxA_gY	[CAFE MUSIC] Coffee and Chill | เพลงบรรเลงร้านกาแฟ ฟังสบายๆ [เล่าสู่กันฟัง,หมอกหรือควัน]	https://i.ytimg.com/vi/Vr2u_DxA_gY/mqdefault.jpg	\N	GMM สบาย สบาย	61	2026-05-09 17:58:06.03147
592	8	eG4k0xQlX30	PLAYLIST ดนตรีบรรเลง | เพลงเพราะ ฟังสบาย | เพลงฮีลใจ ฟังไปเพลินๆ	https://i.ytimg.com/vi/eG4k0xQlX30/mqdefault.jpg	\N	GMM สบาย สบาย	62	2026-05-09 17:58:06.036787
593	8	bbxXdASyLQw	Book & Coffee Jazz - Warm Cozy Music for Reading, Work, Study and Coffee Time	https://i.ytimg.com/vi/bbxXdASyLQw/mqdefault.jpg	\N	Musictag	63	2026-05-09 17:58:06.042169
594	8	LeGV8y9g4AM	[CAFE PLAYLIST] ตื่นสาย ฟังเพลงชิล | Bossa Nova and Brunch Music	https://i.ytimg.com/vi/LeGV8y9g4AM/mqdefault.jpg	\N	GMM สบาย สบาย	64	2026-05-09 17:58:06.047771
595	8	zRZsvD01KvA	#cafejazz | ดนตรีฮีลใจ ในร้านกาแฟ	https://i.ytimg.com/vi/zRZsvD01KvA/mqdefault.jpg	\N	GMM สบาย สบาย	65	2026-05-09 17:58:06.053244
596	8	HSvdYLPDYrI	Smooth Jazz Longplay | เพลงบรรเลงเพราะๆ ปลุกพลัง ฟังแล้วสดชื่น	https://i.ytimg.com/vi/HSvdYLPDYrI/mqdefault.jpg	\N	GMM สบาย สบาย	66	2026-05-09 17:58:06.05812
597	8	CBxS5P9l9lg	MORNING BOSSA NOVA | ดนตรีบรรเลงฟังสบายยามเช้า	https://i.ytimg.com/vi/CBxS5P9l9lg/mqdefault.jpg	\N	GMM สบาย สบาย	67	2026-05-09 17:58:06.062312
598	8	MYPVQccHhAQ	4K Cozy Coffee Shop with Smooth Piano Jazz Music for Relaxing, Studying and Working	https://i.ytimg.com/vi/MYPVQccHhAQ/mqdefault.jpg	\N	Relaxing Jazz Piano	68	2026-05-09 17:58:06.067091
599	8	nRl-ZtSjbjk	ดนตรีฟังเพลินตอนจิบกาแฟ | BOSSA & CAFÉ	https://i.ytimg.com/vi/nRl-ZtSjbjk/mqdefault.jpg	\N	GMM สบาย สบาย	69	2026-05-09 17:58:06.072184
600	8	2fBMHENNprU	ดนตรีผ่อนคลาย ชิลยามบ่าย ฟังสบายใจ | Afternoon Chill Music	https://i.ytimg.com/vi/2fBMHENNprU/mqdefault.jpg	\N	GMM สบาย สบาย	70	2026-05-09 17:58:06.077083
601	8	KT9CGpr6o0Y	#lofichill | เพลงชิล ตอนจิบกาแฟ ฟังสบาย หายเหนื่อย	https://i.ytimg.com/vi/KT9CGpr6o0Y/mqdefault.jpg	\N	GMM สบาย สบาย	71	2026-05-09 17:58:06.081736
602	8	MansaUiJAWo	#caferadio | ดนตรีบรรเลงช้าๆ เปิดในร้านกาแฟชิลๆ | Smooth Jazz & Coffee Break	https://i.ytimg.com/vi/MansaUiJAWo/mqdefault.jpg	\N	GMM สบาย สบาย	72	2026-05-09 17:58:06.086494
603	8	152-dioGGNo	COFFEE BGM | เพลงชิลฟังสบาย สไตล์ร้านกาแฟ	https://i.ytimg.com/vi/152-dioGGNo/mqdefault.jpg	\N	GMM สบาย สบาย	73	2026-05-09 17:58:06.091021
604	8	Af8KlUDdIVQ	จิบกาแฟฟังสบาย ใจเย็นอารมณ์ดี	https://i.ytimg.com/vi/Af8KlUDdIVQ/mqdefault.jpg	\N	GMM สบาย สบาย	74	2026-05-09 17:58:06.096395
605	8	6cVanENM7Fo	จิบกาแฟร้อนๆ ฟังเพลงเย็นๆ ชิลๆ | Acoustic Cafe Chill Music	https://i.ytimg.com/vi/6cVanENM7Fo/mqdefault.jpg	\N	GMM สบาย สบาย	75	2026-05-09 17:58:06.101464
606	8	37Gg57mDELI	#เพลงบรรเลง แจ๊สไทย ฟังสบาย | THAI JAZZY BGM	https://i.ytimg.com/vi/37Gg57mDELI/mqdefault.jpg	\N	GMM สบาย สบาย	76	2026-05-09 17:58:06.107099
607	8	ikyTsSouSxc	ดนตรีจิบกาแฟ เพลงสบายใจ ฟังสบายหู | Thai Jazz Coffee Music 2025	https://i.ytimg.com/vi/ikyTsSouSxc/mqdefault.jpg	\N	GMM สบาย สบาย	77	2026-05-09 17:58:06.112286
608	8	4hFW6PKJ1bg	เพลงเพราะฟีลดี ฟังในร้านกาแฟเพลินๆ | Lo-Fi Jazz Cafe Playlist	https://i.ytimg.com/vi/4hFW6PKJ1bg/mqdefault.jpg	\N	GMM สบาย สบาย	78	2026-05-09 17:58:06.117048
609	8	y8yNbVX7I24	เพลงชิลยามบ่าย จิบไป ฟังไป | Jazzy Chill Music 2025	https://i.ytimg.com/vi/y8yNbVX7I24/mqdefault.jpg	\N	GMM สบาย สบาย	79	2026-05-09 17:58:06.122259
610	8	BLlhzyNr9V0	อะคูสติก เพลงฟังเพลิน เปิดไว้ในคาเฟ่	https://i.ytimg.com/vi/BLlhzyNr9V0/mqdefault.jpg	\N	GMM สบาย สบาย	80	2026-05-09 17:58:06.12795
611	8	7IZ4XxQrRP0	ดนตรีบรรเลงร้านกาแฟ เพลงเพราะช้าๆ ฟังชิลๆ | Coffee Shop Chill Music	https://i.ytimg.com/vi/7IZ4XxQrRP0/mqdefault.jpg	\N	GMM สบาย สบาย	81	2026-05-09 17:58:06.133035
612	8	gBTU0XHfW1Y	เพลงบรรเลงยามบ่าย ฟังผ่อนคลายเพลินๆ | Afternoon Chill Music	https://i.ytimg.com/vi/gBTU0XHfW1Y/mqdefault.jpg	\N	GMM สบาย สบาย	82	2026-05-09 17:58:06.139161
613	8	SKpimQIwGj0	ฟังเพลงเพลินใจ เปิดคลอไว้ตอนจิบกาแฟ | Coffee Shop BGM Playlist	https://i.ytimg.com/vi/SKpimQIwGj0/mqdefault.jpg	\N	GMM สบาย สบาย	83	2026-05-09 17:58:06.144493
614	8	YKPuRtUN1Og	เพลงบรรเลงเพราะๆ โดนใจสายคาเฟ่ | Cafe BGM Playlist	https://i.ytimg.com/vi/YKPuRtUN1Og/mqdefault.jpg	\N	GMM สบาย สบาย	84	2026-05-09 17:58:06.150296
615	8	tRzE-Pve0ZI	เพลงจิบกาแฟ ฟังเพลินยามบ่าย | Afternoon Chill Vibes BGM	https://i.ytimg.com/vi/tRzE-Pve0ZI/mqdefault.jpg	\N	GMM สบาย สบาย	85	2026-05-09 17:58:06.15575
616	8	bYBoxl0saC0	ชงกาแฟ ฟังเพลงชิลๆ | Coffee Time BGM Playlist	https://i.ytimg.com/vi/bYBoxl0saC0/mqdefault.jpg	\N	GMM สบาย สบาย	86	2026-05-09 17:58:06.161349
617	8	a6OMsaMCdw4	อยู่บ้านฟังเพลงชิล ได้ฟีลอยู่ร้านกาแฟ | Home Cafe Playlist	https://i.ytimg.com/vi/a6OMsaMCdw4/mqdefault.jpg	\N	GMM สบาย สบาย	87	2026-05-09 17:58:06.166678
618	8	5SNH47xZLjs	#ฟังเพลงไทย สไตล์ร้านกาแฟ | Coffee Shop BGM Playlist	https://i.ytimg.com/vi/5SNH47xZLjs/mqdefault.jpg	\N	GMM สบาย สบาย	88	2026-05-09 17:58:06.171726
619	8	rJBKaMKplDk	ดนตรีบรรเลง ฟังเพลงตอนทำกาแฟ | Coffee House BGM Playlist	https://i.ytimg.com/vi/rJBKaMKplDk/mqdefault.jpg	\N	GMM สบาย สบาย	89	2026-05-09 17:58:06.177279
620	8	5APSBhI3DeU	จิบกาแฟฟังเพลงเพราะ ฟีลดีๆ ฟังเพลินๆ | Coffee & Piano	https://i.ytimg.com/vi/5APSBhI3DeU/mqdefault.jpg	\N	GMM สบาย สบาย	90	2026-05-09 17:58:06.182655
621	8	SiEpVLU2Dzc	ดนตรีแจ๊สฟังสบาย ไว้เปิดคลอในคาเฟ่ | Coffe & Jazz BGM	https://i.ytimg.com/vi/SiEpVLU2Dzc/mqdefault.jpg	\N	GMM สบาย สบาย	91	2026-05-09 17:58:06.187223
622	8	MfK34i20rvw	ดนตรีฟังชิลๆ ได้ฟีลตอนจิบกาแฟ | Coffee & Thai Jazz BGM Playlist	https://i.ytimg.com/vi/MfK34i20rvw/mqdefault.jpg	\N	GMM สบาย สบาย	92	2026-05-09 17:58:06.192222
623	8	mBwdclNgwjI	#เพลงร้านกาแฟ ฟังสบาย สไตล์บอสซ่า | Bossa Nova Café Mix BGM	https://i.ytimg.com/vi/mBwdclNgwjI/mqdefault.jpg	\N	GMM สบาย สบาย	93	2026-05-09 17:58:06.196437
624	8	f1BtL29Yogo	#ดนตรีร้านกาแฟ ฟังตอนฝนพรำ ฮัมตามได้ | Café Music with Rainy Mood	https://i.ytimg.com/vi/f1BtL29Yogo/mqdefault.jpg	\N	GMM สบาย สบาย	94	2026-05-09 17:58:06.201206
625	8	Uco_xxCZAj8	รวมเพลงชิลๆ เปิดฟังยามบ่าย | ฟังเสียงฝนสบายๆ ในวันพักผ่อน	https://i.ytimg.com/vi/Uco_xxCZAj8/mqdefault.jpg	\N	GMM สบาย สบาย	95	2026-05-09 17:58:06.206
626	8	zPkWzdGKhdM	รวมเพลงไทย เปิดคลอไว้ในร้านอาหาร | Thai Restaurants BGM Playlist	https://i.ytimg.com/vi/zPkWzdGKhdM/mqdefault.jpg	\N	GMM สบาย สบาย	96	2026-05-09 17:58:06.211391
627	8	AgicfTq7kDU	ดนตรีบรรเลงเพราะๆ เพลงฟังเพลินละมุนหู | Thai Pop Cafe BGM	https://i.ytimg.com/vi/AgicfTq7kDU/mqdefault.jpg	\N	GMM สบาย สบาย	97	2026-05-09 17:58:06.216345
628	8	Q6ylr-jwdio	เพลงเพราะ เหมาะฟังในร้านกาแฟ | Cafe Thai BGM	https://i.ytimg.com/vi/Q6ylr-jwdio/mqdefault.jpg	\N	GMM สบาย สบาย	98	2026-05-09 17:58:06.221295
629	8	l8T_PP7io_c	ดนตรีบรรเลงผ่อนคลาย เพลงฟังสบายในมื้อเช้า | Breakfast & Bossa BGM	https://i.ytimg.com/vi/l8T_PP7io_c/mqdefault.jpg	\N	GMM สบาย สบาย	99	2026-05-09 17:58:06.226307
630	8	exclo_0Rk4U	ดนตรีแจ๊สบรรเลงเพราะๆ ฟังเพลงรักในร้านกาแฟ | Cozy & Jazzy Thai Love Songs	https://i.ytimg.com/vi/exclo_0Rk4U/mqdefault.jpg	\N	GMM สบาย สบาย	100	2026-05-09 17:58:06.231452
631	8	Httt3JU9nCg	เพลงไทยสไตล์สากล ฟังเพลินในร้านกาแฟ | Thai Café Playlist	https://i.ytimg.com/vi/Httt3JU9nCg/mqdefault.jpg	\N	GMM สบาย สบาย	101	2026-05-09 17:58:06.236484
632	8	AfQwMoLGWdg	ดนตรีบรรเลงเพราะๆ เพลงรักหวานละมุนฟังคุ้นหู	https://i.ytimg.com/vi/AfQwMoLGWdg/mqdefault.jpg	\N	GMM สบาย สบาย	102	2026-05-09 17:58:06.241676
633	8	N3PnwEkV0DY	รวมเพลงร้านกาแฟ 2025 ดนตรีฟังชิลฟีลอยู่คาเฟ่ | Cafe Jazz & Cozy Coffee BGM	https://i.ytimg.com/vi/N3PnwEkV0DY/mqdefault.jpg	\N	GMM สบาย สบาย	103	2026-05-09 17:58:06.246408
634	8	OnYUM7tjI2Q	รวมเพลงไทยสบายๆ เปิดฟังเพลินๆตอนชงชาชิลๆ | Thai Tea Break Playlist	https://i.ytimg.com/vi/OnYUM7tjI2Q/mqdefault.jpg	\N	GMM สบาย สบาย	104	2026-05-09 17:58:06.251819
635	8	MbR5hO-y4Ws	รวมเพลงผ่อนคลายชิลๆ เพลงเพราะเหมาะเปิดในคาเฟ | Café Jazzy BGM Playlist	https://i.ytimg.com/vi/MbR5hO-y4Ws/mqdefault.jpg	\N	GMM สบาย สบาย	105	2026-05-09 17:58:06.25694
636	8	KNPSUszw2hY	บอสซาโนว่า พักใจจิบชา ฟังเพลินสบายๆ | Bossa Nova & Tea Playlist	https://i.ytimg.com/vi/KNPSUszw2hY/mqdefault.jpg	\N	GMM สบาย สบาย	106	2026-05-09 17:58:06.261695
637	8	yUNhrL9vz0g	ดนตรีอารมณ์ดี ฟังเพลินในร้านกาแฟ	https://i.ytimg.com/vi/yUNhrL9vz0g/mqdefault.jpg	\N	GMM สบาย สบาย	107	2026-05-09 17:58:06.266439
638	8	CSFwJwfbSMg	[LONGPLAY] เพลงร้านกาแฟ ดนตรีฟังเพลิน 3 ชั่วโมง #ฟังเพลงยาวๆ #ไม่มีโฆษณา	https://i.ytimg.com/vi/CSFwJwfbSMg/mqdefault.jpg	\N	GMM สบาย สบาย	108	2026-05-09 17:58:06.271788
639	8	9o-vHYajFIg	ดนตรีชิวสบายๆ ฟังตอนบ่าย จิบกาแฟ	https://i.ytimg.com/vi/9o-vHYajFIg/mqdefault.jpg	\N	GMM สบาย สบาย	109	2026-05-09 17:58:06.277212
640	8	aU5ipEesxoI	ดนตรีผ่อนคลายเพราะๆ เปิดเบาๆ ฟังเพลินมาก | Tea Break Music	https://i.ytimg.com/vi/aU5ipEesxoI/mqdefault.jpg	\N	GMM สบาย สบาย	110	2026-05-09 17:58:06.282187
641	8	X9DOElulbYc	ฟังเพลงออนไลน์เพราะๆ เปิดคลอไว้ในร้านกาแฟ | Café Music BGM Playlist	https://i.ytimg.com/vi/X9DOElulbYc/mqdefault.jpg	\N	GMM สบาย สบาย	111	2026-05-09 17:58:06.287351
642	8	L5PaFfbNlmk	รวมเพลงบรรเลงแจ๊สไทย จิบกาแฟฟังชิลๆ | เพลงร้านกาแฟ ฟังยาวต่อเนื่อง	https://i.ytimg.com/vi/L5PaFfbNlmk/mqdefault.jpg	\N	GMM สบาย สบาย	112	2026-05-09 17:58:06.292454
643	8	OVG928am3VA	รวมเพลงเพราะๆ จิบกาแฟ ฟังสบายในวันหยุด | Holiday Cafe Music Vol.1	https://i.ytimg.com/vi/OVG928am3VA/mqdefault.jpg	\N	GMM สบาย สบาย	113	2026-05-09 17:58:06.297494
644	8	qhk0cue9SFc	รวมเพลงเพราะๆ จิบกาแฟ ฟังสบายในวันหยุด | Holiday Cafe Music Vol.2	https://i.ytimg.com/vi/qhk0cue9SFc/mqdefault.jpg	\N	GMM สบาย สบาย	114	2026-05-09 17:58:06.30205
645	8	DPNtmd72lQk	ดนตรีบรรเลง รวมเพลงร้านกาแฟ ฟังยาวๆ ต่อเนื่อง  | Café BGM Playlist	https://i.ytimg.com/vi/DPNtmd72lQk/mqdefault.jpg	\N	GMM สบาย สบาย	115	2026-05-09 17:58:06.306745
646	8	9Ti3rFSkSus	รวมเพลงเพราะๆ จิบกาแฟ ฟังสบายในวันหยุด | Holiday Cafe Music Vol.3	https://i.ytimg.com/vi/9Ti3rFSkSus/mqdefault.jpg	\N	GMM สบาย สบาย	116	2026-05-09 17:58:06.312156
647	8	fqW1zL5r3es	#ดนตรีบรรเลง เพลงร้านกาแฟฟังสบายๆ เพลงเพราะออนไลน์ ต่อเนื่อง | Café BGM Playlist	https://i.ytimg.com/vi/fqW1zL5r3es/mqdefault.jpg	\N	GMM สบาย สบาย	117	2026-05-09 17:58:06.317168
648	8	ZqnZ_i7Xh8g	รวมเพลงเพราะๆ จิบกาแฟ ฟังสบายในวันหยุด | Holiday Cafe Music Vol.5	https://i.ytimg.com/vi/ZqnZ_i7Xh8g/mqdefault.jpg	\N	GMM สบาย สบาย	118	2026-05-09 17:58:06.329424
649	8	FL-0k_4UQ2A	ดนตรีบรรเลง ฟังเพลงรัก ฤดูหนาว #ฟังเพลงออนไลน์  | Winter Love Songs Longplay	https://i.ytimg.com/vi/FL-0k_4UQ2A/mqdefault.jpg	\N	GMM สบาย สบาย	119	2026-05-09 17:58:06.335144
650	8	YuGTtX_-wsQ	ดนตรีบรรเลง ทำนองคุ้น ฟังแล้วอุ่นใจ | Winter Mood Background Music	https://i.ytimg.com/vi/YuGTtX_-wsQ/mqdefault.jpg	\N	GMM สบาย สบาย	120	2026-05-09 17:58:06.34095
651	8	lPnxZ7LamxQ	ดนตรีเพราะๆ เพลงฮีลใจ เปิดคลอไว้ในร้านกาแฟ | Café Music BGM Playlist	https://i.ytimg.com/vi/lPnxZ7LamxQ/mqdefault.jpg	\N	GMM สบาย สบาย	121	2026-05-09 17:58:06.345674
652	8	v2W-Fjqp1zU	#bossacafejazz | บอสซาโนว่า เพลงหวานฟังในร้านกาแฟ	https://i.ytimg.com/vi/v2W-Fjqp1zU/mqdefault.jpg	\N	GMM สบาย สบาย	122	2026-05-09 17:58:06.351603
653	8	hLFJqFTwal4	รวมเพลงฟีลดี ฟังตอนเช้าๆ | รวมเพลงฟังยาวต่อเนื่อง | Good Energy Music Playlist	https://i.ytimg.com/vi/hLFJqFTwal4/mqdefault.jpg	\N	GMM สบาย สบาย	123	2026-05-09 17:58:06.356627
654	8	WuRLkuMUGJw	รวมเพลงฟีลดี ฟังตอนเช้าๆ | ฟังยาวๆต่อเนื่อง | Good Energy Morning Playlist	https://i.ytimg.com/vi/WuRLkuMUGJw/mqdefault.jpg	\N	GMM สบาย สบาย	124	2026-05-09 17:58:06.361807
655	8	LXw4gh7Q95U	ดนตรีบรรเลง แจ๊สไทยเพราะๆ เปิดคลอในคาเฟ่ [Cafe Thai Jazz Playlist]	https://i.ytimg.com/vi/LXw4gh7Q95U/mqdefault.jpg	\N	GMM สบาย สบาย	125	2026-05-09 17:58:06.366583
656	8	U6dHQh-mWgY	เพลงบรรเลงเพราะๆ เพลงเพราะน่าฟัง เหมือนนั่งในคาเฟ่ #เพลงร้านกาแฟ2026	https://i.ytimg.com/vi/U6dHQh-mWgY/mqdefault.jpg	\N	GMM สบาย สบาย	126	2026-05-09 17:58:06.372227
657	8	Rt81nJjgyZA	เพลงบรรเลงไทยสไตล์แจ๊ส จิบกาแฟ ฟังเพลินๆ - Cafe Bgm Playlist	https://i.ytimg.com/vi/Rt81nJjgyZA/mqdefault.jpg	\N	GMM สบาย สบาย	127	2026-05-09 17:58:06.376796
658	8	GrREDE17Q9s	#เพลงร้านกาแฟ2026 | เพลงแจ๊สไทย สไตล์ร้านกาแฟ ฟังยาวต่อเนื่อง | Thai Cafe Jazz Playlist	https://i.ytimg.com/vi/GrREDE17Q9s/mqdefault.jpg	\N	GMM สบาย สบาย	128	2026-05-09 17:58:06.381717
659	8	Ca-5JDpS1co	#เพลงบรรเลงร้านกาแฟ | เพลงแจ๊สไทย สไตล์คาเฟ่ ฟังยาวต่อเนื่อง | Thai Cafe Jazz Playlist	https://i.ytimg.com/vi/Ca-5JDpS1co/mqdefault.jpg	\N	GMM สบาย สบาย	129	2026-05-09 17:58:06.386392
660	8	woswzTyaZ-I	#ดนตรีบรรเลงร้านกาแฟ รวมเพลงฟังสบาย สไตล์คาเฟ่ | Thai Cafe Jazz Playlist	https://i.ytimg.com/vi/woswzTyaZ-I/mqdefault.jpg	\N	GMM สบาย สบาย	130	2026-05-09 17:58:06.391321
661	8	x7EUB8qXqGw	ฟังเพลงออนไลน์ ดนตรีฟังสบายๆ สไตล์ร้านกาแฟ ฟังยาวต่อเนื่อง | Thai Cafe Jazz Playlist	https://i.ytimg.com/vi/x7EUB8qXqGw/mqdefault.jpg	\N	GMM สบาย สบาย	131	2026-05-09 17:58:06.396222
662	8	xQK_6N5yv8E	#ฟังเพลงออนไลน์ ดนตรีฟังสบายๆ สไตล์คาเฟ่ | ฟังยาวต่อเนื่อง | Thai Cafe Jazz Playlist	https://i.ytimg.com/vi/xQK_6N5yv8E/mqdefault.jpg	\N	GMM สบาย สบาย	132	2026-05-09 17:58:06.40123
663	8	_W9Jy4hpyTw	#ดนตรีบรรเลงเพราะๆ เพลงทำงาน จิบกาแฟเพลินๆ 1 ชั่วโมงเต็ม	https://i.ytimg.com/vi/_W9Jy4hpyTw/mqdefault.jpg	\N	GMM สบาย สบาย	133	2026-05-09 17:58:06.406526
664	8	fHvsr4ODKtg	ดนตรีบรรเลง เพลงแจ๊สไทย สไตล์ร้านกาแฟ Vol.1 | Coffee Shop BGM	https://i.ytimg.com/vi/fHvsr4ODKtg/mqdefault.jpg	\N	GMM สบาย สบาย	134	2026-05-09 17:58:06.411716
665	8	L3X3KT0aL3Q	ดนตรีบรรเลง เพลงแจ๊สไทย สไตล์ร้านกาแฟ Vol.2 | COFFEE SHOP BGM PLAYLIST #lofi #longplay	https://i.ytimg.com/vi/L3X3KT0aL3Q/mqdefault.jpg	\N	GMM สบาย สบาย	135	2026-05-09 17:58:06.41685
666	8	lav05FH1h_g	ดนตรีบรรเลง เพลงหวานๆ ในร้านกาแฟ #เพลงร้านกาแฟ2026 #เพลงบรรเลงเพราะๆ	https://i.ytimg.com/vi/lav05FH1h_g/mqdefault.jpg	\N	GMM สบาย สบาย	136	2026-05-09 17:58:06.422325
667	8	xd911jJSFtI	ดนตรีบรรเลง เพลงผ่อนคลาย ฟังสบายๆ #ฟังตอนทำงาน #เพลงจิบกาแฟ #ฟังเพลงออนไลน์ | Café BGM Playlist	https://i.ytimg.com/vi/xd911jJSFtI/mqdefault.jpg	\N	GMM สบาย สบาย	137	2026-05-09 17:58:06.427656
668	8	KZi4DpAyqFQ	#ดนตรีบรรเลงเพราะๆ เพลงแจ๊สไทย สไตล์ร้านกาแฟ Vol.3 [ ดนตรีเปิดคลอๆ ในร้านกาแฟ ]	https://i.ytimg.com/vi/KZi4DpAyqFQ/mqdefault.jpg	\N	GMM สบาย สบาย	138	2026-05-09 17:58:06.433205
669	8	VS3YAv9BiHc	[1 hr] Playlist ดนตรีบรรเลง เพลงแจ๊สไทย สไตล์ร้านกาแฟ Vol.4 | COFFEE SHOP BGM #lofi #longplay	https://i.ytimg.com/vi/VS3YAv9BiHc/mqdefault.jpg	\N	GMM สบาย สบาย	139	2026-05-09 17:58:06.437915
670	8	cwJR8_bcCRA	[1 hr] Playlist ดนตรีบรรเลงเพราะๆ จิบกาแฟฟังเพลินๆ | Thai Bossa Nova Cafe Music	https://i.ytimg.com/vi/cwJR8_bcCRA/mqdefault.jpg	\N	GMM สบาย สบาย	140	2026-05-09 17:58:06.443217
671	8	B-8hEQKjqIs	#เพลงบรรเลงเพราะๆ รวมเพลงรัก ฟังคลายร้อน | Summer Chill Music #รวมเพลงสงกรานต์	https://i.ytimg.com/vi/B-8hEQKjqIs/mqdefault.jpg	\N	GMM สบาย สบาย	141	2026-05-09 17:58:06.448316
672	8	iBSwA45EIao	#เพลงบรรเลง รวมเพลงรัก ฟังคลายร้อน | Summer Chill Music #เพลงรักฟังสบาย #เพลงยุค90	https://i.ytimg.com/vi/iBSwA45EIao/mqdefault.jpg	\N	GMM สบาย สบาย	142	2026-05-09 17:58:06.453149
674	9	seSAbPej20w	SOULNIST - เมดเลย์เพลงโยกเบา ๆ 【Wake Session】	https://i.ytimg.com/vi/seSAbPej20w/mqdefault.jpg	\N	Wake Studio	2	2026-05-10 12:31:54.70784
675	9	p90ODV8EoOg	เพลงรัก  - JES Jespipat【COVER VERSION】	https://i.ytimg.com/vi/p90ODV8EoOg/mqdefault.jpg	\N	Jes's First Time	3	2026-05-10 12:31:54.712907
676	9	Wzol0hwzQKM	ถ้าคิดถึงเธอมากกว่านี้   Koh Mr saxman	https://i.ytimg.com/vi/Wzol0hwzQKM/mqdefault.jpg	\N	Koh Mr.saxman	4	2026-05-10 12:31:54.71878
677	9	-JGRa56hc0o	คนที่ฆ่าฉัน - Silly Fools (Cover by RMY2K)	https://i.ytimg.com/vi/-JGRa56hc0o/mqdefault.jpg	\N	RMY2K	5	2026-05-10 12:31:54.724141
678	9	5w0BqXKwxYc	ขอบคุณที่เกิดมาให้รัก | MEAN at Overcoat Music Festival ครั้งที่ 13 2023 [Live]	https://i.ytimg.com/vi/5w0BqXKwxYc/mqdefault.jpg	\N	MEAN Band Official	6	2026-05-10 12:31:54.729391
679	9	8E3xBkSAxUU	ความรักดีๆ อยู่ที่ไหน (Original by Peet Peera) - Tata THX Ver. [RE:VIBES PROJECT] | OFFICIAL MV	https://i.ytimg.com/vi/8E3xBkSAxUU/mqdefault.jpg	\N	E29	7	2026-05-10 12:31:54.734178
680	9	JqwcASxsdu0	คำเชย ๆ - JES Jespipat 【COVER VERSION】	https://i.ytimg.com/vi/JqwcASxsdu0/mqdefault.jpg	\N	Jes's First Time	8	2026-05-10 12:31:54.739034
681	9	nMM9k1VEXtI	ETC ชวนมาแจม "หยุด & สิ่งมีชีวิตที่เรียกว่าหัวใจ " l GROOVE RIDERS	https://i.ytimg.com/vi/nMM9k1VEXtI/mqdefault.jpg	\N	TheETCband	9	2026-05-10 12:31:54.743188
682	9	4zBkUxCnGUg	เนื้อเพลง ถนนแปลกแยก - อาจารย์ไข่ มาลีฮวนน่า	https://i.ytimg.com/vi/4zBkUxCnGUg/mqdefault.jpg	\N	เพลงคนเพื่อชีวิต	10	2026-05-10 12:31:54.748118
683	9	TpB5TIYzCnw	รวมเพลงฮีลใจ ผ่อนคลายในวันที่เหนื่อยล้า [ Playlist Long Play ]	https://i.ytimg.com/vi/TpB5TIYzCnw/mqdefault.jpg	\N	marr team official	11	2026-05-10 12:31:54.752829
684	9	kz41FmIUJK4	ฟังยาวๆ โยกเพลินๆ MEDLEY no.4 x @RUBSARBproduction  Covered By Mass Music	https://i.ytimg.com/vi/kz41FmIUJK4/mqdefault.jpg	\N	Mass Music	12	2026-05-10 12:31:54.758037
685	9	udvhDjCtP88	นิดหน่อย - โจอี้ ภูวศิษฐ์「 T-REX Cover 」	https://i.ytimg.com/vi/udvhDjCtP88/mqdefault.jpg	\N	T-Rex Tube	13	2026-05-10 12:31:54.76202
686	9	O6QP45HiiZQ	CookieCutter | เมดเลย์ Big Ass 【 Wake Session 】	https://i.ytimg.com/vi/O6QP45HiiZQ/mqdefault.jpg	\N	Wake Studio	14	2026-05-10 12:31:54.766838
687	9	EmqoH2CN--E	ผู้ถูกเลือกให้ผิดหวัง -  (Y2Rock​Y2Play ​Live​ Session​EP.2)	https://i.ytimg.com/vi/EmqoH2CN--E/mqdefault.jpg	\N	Y2Rock 	15	2026-05-10 12:31:54.771263
688	9	hsmuz4lp3fY	เพื่อชีวิตมันส์ๆ - เจมส์ เจษฎา -รถแห่วารีศิลป์ อิสาน   มหกรรมบางพลี	https://i.ytimg.com/vi/hsmuz4lp3fY/mqdefault.jpg	\N	รถแห่ วารีศิลป์อิสาน OFFICIAL.	16	2026-05-10 12:31:54.775723
689	9	Oks7Tw7hBZw	9tokyo - เธอโดนทำร้ายมามากพอแล้ว Feat.  2T FLOW	https://i.ytimg.com/vi/Oks7Tw7hBZw/mqdefault.jpg	\N	9tokyo	17	2026-05-10 12:31:54.780158
690	9	jmHDFdATUtA	ถ้าย้อนเวลากลับไปได้ฉันจะ - NOO MIDDAM[TUAJING] x DAX ROCK RIDER x MHOR T_047 [LIVE SESSION]	https://i.ytimg.com/vi/jmHDFdATUtA/mqdefault.jpg	\N	ME RECORDS	18	2026-05-10 12:31:54.785114
691	9	0TvbL6vaH-c	ยกล้อเข้าป่า QQ หลวงพะบาง X 2025 DJ NamNam x MC GOLF x MC PETH ใหลยูหวาสู x เพลงแดนซ์ ￼#สายปาร์ตี้	https://i.ytimg.com/vi/0TvbL6vaH-c/mqdefault.jpg	\N	PETH x NamNam	19	2026-05-10 12:31:54.789789
692	9	jVgzhi7134U	กอด - Clash  // Drama Band COVER @HH_CAFE	https://i.ytimg.com/vi/jVgzhi7134U/mqdefault.jpg	\N	HIGH HOW cafe	20	2026-05-10 12:31:54.794808
693	9	vO30KdXsJ_k	ฝาก - Q Cover -   The Gentlemans	https://i.ytimg.com/vi/vO30KdXsJ_k/mqdefault.jpg	\N	# นักร้องผมยาว	21	2026-05-10 12:31:54.800265
695	9	fVNEt8qNjSI	มารักทำไมตอนนี้ - ฝ้าย Am Fine | นักผจญเพลง REPLAY	https://i.ytimg.com/vi/fVNEt8qNjSI/mqdefault.jpg	\N	Thai PBS	23	2026-05-10 12:31:54.810885
696	9	XkUXmoEiaeM	ละเลย - INFAMOUS OFFCIAL LIVE SESSION	https://i.ytimg.com/vi/XkUXmoEiaeM/mqdefault.jpg	\N	InfamousBand	24	2026-05-10 12:31:54.816205
697	4	8NkHAzmpGmo	ด้วยรักและปลาทู - มอส ปฏิภาณ  【OFFICIAL MV】	https://i.ytimg.com/vi/8NkHAzmpGmo/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	72	2026-05-12 03:41:48.175423
698	10	W2Ia6W_Gtxw	อาจจะเป็นคนนี้ - แหวน ฐิติมา I Cover by เอย #SweetHours	https://i.ytimg.com/vi/W2Ia6W_Gtxw/mqdefault.jpg	\N	Chill ChiangRai2020	1	2026-05-29 02:37:26.366256
699	10	GYQijGbNMZ8	ยังยิ้มได้ - พลพล I Cover by Leema	https://i.ytimg.com/vi/GYQijGbNMZ8/mqdefault.jpg	\N	Chill ChiangRai2020	2	2026-05-29 02:37:26.377536
700	10	ay5MKOAwTVg	เขียนไว้ข้างเตียง - PARADOX I Cover by เอมมี่ [ prAy ]	https://i.ytimg.com/vi/ay5MKOAwTVg/mqdefault.jpg	\N	Chill ChiangRai2020	3	2026-05-29 02:37:26.382568
701	10	b0rvlJD9S6Q	ดอกไม้กับแจกัน -ใหม่ เจริญปุระ I Cover by เอย [ SweetHours ]	https://i.ytimg.com/vi/b0rvlJD9S6Q/mqdefault.jpg	\N	Chill ChiangRai2020	4	2026-05-29 02:37:26.387255
702	10	DeVUXh9s-L4	รักแท้มีแค่ครั้งเดียว - อินคา I Cover by Leema [ SweetHours ]	https://i.ytimg.com/vi/DeVUXh9s-L4/mqdefault.jpg	\N	Chill ChiangRai2020	5	2026-05-29 02:37:26.392387
703	10	lKcgCA7R8AY	สองใจ [เพลงจากละครวันทอง] - ดา เอ็นโดรฟิน I by เอย [ SweetHours ]	https://i.ytimg.com/vi/lKcgCA7R8AY/mqdefault.jpg	\N	Chill ChiangRai2020	6	2026-05-29 02:37:26.397746
704	10	6rkKynoQ8U4	ฉันไม่ใช่นางเอก - ศิริพร อยู่ยอด I Cover by เอย [ SweetHours ]	https://i.ytimg.com/vi/6rkKynoQ8U4/mqdefault.jpg	\N	Chill ChiangRai2020	7	2026-05-29 02:37:26.403503
705	10	5yl8_V1Xn-w	เธอปันใจ - อัสนี โชติกุล ; วสันต์ โชติกุล I Cover by Leema [ SweetHours ]	https://i.ytimg.com/vi/5yl8_V1Xn-w/mqdefault.jpg	\N	Chill ChiangRai2020	8	2026-05-29 02:37:26.408781
706	10	AIMoFXVZKH8	เลิกรา - แมว จิรศักดิ์ I Cover by เอย [ SweetHours ] Chill ChaingRai	https://i.ytimg.com/vi/AIMoFXVZKH8/mqdefault.jpg	\N	Chill ChiangRai2020	9	2026-05-29 02:37:26.416405
707	10	I2GCOMtM1Mw	อยากให้รู้ว่าเหงา - เจ เจตริน I Cover by กัน [ prAy ]	https://i.ytimg.com/vi/I2GCOMtM1Mw/mqdefault.jpg	\N	Chill ChiangRai2020	10	2026-05-29 02:37:26.422001
708	10	zj89LJrZ6BE	รักสามเศร้า : พริกไทย I Cover by แคท [ JCG BAND ]	https://i.ytimg.com/vi/zj89LJrZ6BE/mqdefault.jpg	\N	Chill ChiangRai2020	11	2026-05-29 02:37:26.426688
709	10	zrQCEHskHig	เขียนถึงคนบนฟ้า - พิง ลำพระเพลิง I Cover by Leema [SweetHours]	https://i.ytimg.com/vi/zrQCEHskHig/mqdefault.jpg	\N	Chill ChiangRai2020	12	2026-05-29 02:37:26.432095
710	10	ScSYLd74S1M	ทนได้ทุกที - ตั้ม สมประสงค์ I Cover by เอย กัญญ์ฐญาณ์ [ SweetHours ]	https://i.ytimg.com/vi/ScSYLd74S1M/mqdefault.jpg	\N	Chill ChiangRai2020	13	2026-05-29 02:37:26.436822
711	10	ugIzq8FFWSk	Move On - ปราโมทย์ วิเลปะนะ I Cover by Leema [ SweetHours ]	https://i.ytimg.com/vi/ugIzq8FFWSk/mqdefault.jpg	\N	Chill ChiangRai2020	14	2026-05-29 02:37:26.441987
712	10	EwTU759Ji6Y	จันทร์ : หญิง ธิติกานต์ I Cover by เอย [ SweetHours ]	https://i.ytimg.com/vi/EwTU759Ji6Y/mqdefault.jpg	\N	Chill ChiangRai2020	15	2026-05-29 02:37:26.447023
713	10	TQoJBJ8oYPg	ใจรัก - สุชาติ ชวางกุร | Cover by โกส จิรัฐ [ JCGband ]	https://i.ytimg.com/vi/TQoJBJ8oYPg/mqdefault.jpg	\N	Chill ChiangRai2020	16	2026-05-29 02:37:26.452187
714	10	_vQ93xDcoRY	100 เหตุผล - STER I Cover by Leema [ SweetHours ]	https://i.ytimg.com/vi/_vQ93xDcoRY/mqdefault.jpg	\N	Chill ChiangRai2020	17	2026-05-29 02:37:26.457049
715	10	7aQ3QQ-eMdc	เธอมีฉัน ฉันมีใคร - DA ENDORPHINE I Cover by เอย [SweetHours]	https://i.ytimg.com/vi/7aQ3QQ-eMdc/mqdefault.jpg	\N	Chill ChiangRai2020	18	2026-05-29 02:37:26.462332
716	10	Pxepy8c5NCo	จากคนอื่นคนไกล - มาช่า วัฒนพานิช I Cover by เกด [ 300BAND ]	https://i.ytimg.com/vi/Pxepy8c5NCo/mqdefault.jpg	\N	Chill ChiangRai2020	19	2026-05-29 02:37:26.467193
717	10	euGxB4afZa0	มือปืน - พงษ์สิทธิ์ คำภีร์ I Cover by ต้อง [ 300BAND ] version หน้ากากทุเรียน	https://i.ytimg.com/vi/euGxB4afZa0/mqdefault.jpg	\N	Chill ChiangRai2020	20	2026-05-29 02:37:26.471605
718	10	M8MHjWE_qrI	รักเธอไม่มีวันหยุด - อ้อน เกวลิน I Cover by เอมมี่ [ prAy ]	https://i.ytimg.com/vi/M8MHjWE_qrI/mqdefault.jpg	\N	Chill ChiangRai2020	21	2026-05-29 02:37:26.476268
719	10	jdqk8FmlAxg	สัมผัส - พั้นช์ วรกาญจน์ I Cover by เอย [ SweetHours ] ที่นี่ที่ CHILL เชียงราย	https://i.ytimg.com/vi/jdqk8FmlAxg/mqdefault.jpg	\N	Chill ChiangRai2020	22	2026-05-29 02:37:26.481036
720	10	sa4RkDDOGC0	รักไม่ได้ - Groove Riders I Cover by ต้อง [ 300BAND ] กดติดตาม	https://i.ytimg.com/vi/sa4RkDDOGC0/mqdefault.jpg	\N	Chill ChiangRai2020	23	2026-05-29 02:37:26.485574
721	10	5WNqlCYTiuE	Michael Learns To Rock - That's Why You Go Away I Cover by Leema [ SweetHours ]	https://i.ytimg.com/vi/5WNqlCYTiuE/mqdefault.jpg	\N	Chill ChiangRai2020	24	2026-05-29 02:37:26.490285
722	10	I5EMA3mbJRo	ผู้หญิงลืมยาก - Pink I Cover by แคท [ JCGband ]	https://i.ytimg.com/vi/I5EMA3mbJRo/mqdefault.jpg	\N	Chill ChiangRai2020	25	2026-05-29 02:37:26.495052
723	10	rE4hJNu1tf8	ผิดไหม - ฟาเรนไฮธ์ I Cover by เอย [ SweetHours ]	https://i.ytimg.com/vi/rE4hJNu1tf8/mqdefault.jpg	\N	Chill ChiangRai2020	26	2026-05-29 02:37:26.499984
724	10	Uvy5ia7zlPY	18 ฝน : เสือ - ธนพล อินทฤทธิ์ I Cover by Leema [ SweetHours ]	https://i.ytimg.com/vi/Uvy5ia7zlPY/mqdefault.jpg	\N	Chill ChiangRai2020	27	2026-05-29 02:37:26.504881
725	10	EWi8PUZyorQ	รักไม่ได้ - Groove Riders I Cover by ต้อง [ 300BAND ]	https://i.ytimg.com/vi/EWi8PUZyorQ/mqdefault.jpg	\N	Chill ChiangRai2020	28	2026-05-29 02:37:26.509774
726	10	hQ-0ncXDnSQ	เสียใจได้ยินไหม - ใหม่ เจริญปุระ I Cover by เอย [ SweetHours ]	https://i.ytimg.com/vi/hQ-0ncXDnSQ/mqdefault.jpg	\N	Chill ChiangRai2020	29	2026-05-29 02:37:26.515037
791	10	iVGMlUdRmu0	ชาวนากับงูเห่า - FLY I Cover by Leema [ Sweet Hours ]	https://i.ytimg.com/vi/iVGMlUdRmu0/mqdefault.jpg	\N	Chill ChiangRai2020	94	2026-05-29 02:37:26.87245
727	10	VREbMxYCoPk	ไม่สมศักดิ์ศรี - ไท ธนาวุฒิ I Cover by เกด [ 300BAND ]	https://i.ytimg.com/vi/VREbMxYCoPk/mqdefault.jpg	\N	Chill ChiangRai2020	30	2026-05-29 02:37:26.519947
728	10	MhMsjyivRqI	ทุกคนเคยร้องไห้ - ป้าง นครินทร์ I Cover by ฟลุ๊ค [ Sunset Band ]	https://i.ytimg.com/vi/MhMsjyivRqI/mqdefault.jpg	\N	Chill ChiangRai2020	31	2026-05-29 02:37:26.525896
729	10	Jh_fQsKxDos	รักเธอให้น้อยลง - BANDWAGON I Cover by แพมมี่ [ Chicken Space ]	https://i.ytimg.com/vi/Jh_fQsKxDos/mqdefault.jpg	\N	Chill ChiangRai2020	32	2026-05-29 02:37:26.531743
730	10	WrW5w-kkZao	กุหลาบแดง - ไก่ พรรณนิภา I Cover by เอย [ Sweet Hours ]	https://i.ytimg.com/vi/WrW5w-kkZao/mqdefault.jpg	\N	Chill ChiangRai2020	33	2026-05-29 02:37:26.536914
731	10	2YVWOlkAjUQ	รวมเพลงเพราะๆเจ็บๆโดนใจผู้หญิง Cover by เอย [ SweetHours ] CHILLเชียงราย	https://i.ytimg.com/vi/2YVWOlkAjUQ/mqdefault.jpg	\N	Chill ChiangRai2020	34	2026-05-29 02:37:26.542175
732	10	jbasPaV3foI	Deleted video		\N		35	2026-05-29 02:37:26.546921
733	10	D7FTRxwUzeo	สงสารกันหน่อย - มาลีวัลย์ เจมีน่า [ Cover By เอย ] CHILLเชียงราย	https://i.ytimg.com/vi/D7FTRxwUzeo/mqdefault.jpg	\N	Chill ChiangRai2020	36	2026-05-29 02:37:26.551716
734	10	2RetWne55R4	ตบมือข้างเดียว - ปาน ธนพร I Cover by เอย SweetHours #CHILLเชียงราย	https://i.ytimg.com/vi/2RetWne55R4/mqdefault.jpg	\N	Chill ChiangRai2020	37	2026-05-29 02:37:26.556661
735	10	5cNpcYJuqWU	ทรายกับทะเล - นันทิดา แก้วบัวสาย Cover by เอย [ Sweet Hours ] CHILLเชียงราย	https://i.ytimg.com/vi/5cNpcYJuqWU/mqdefault.jpg	\N	Chill ChiangRai2020	38	2026-05-29 02:37:26.561456
736	10	t9m2zBii0eU	ได้ยินไหม - Da endorphine I Cover by เกด #Chillเชียงราย	https://i.ytimg.com/vi/t9m2zBii0eU/mqdefault.jpg	\N	Chill ChiangRai2020	39	2026-05-29 02:37:26.566457
737	10	xNTz9iuGwWk	เกินใจจะอดทน - SYAM I Cover by Kai [ Chicken Space ] #CHILLเชียงราย	https://i.ytimg.com/vi/xNTz9iuGwWk/mqdefault.jpg	\N	Chill ChiangRai2020	40	2026-05-29 02:37:26.570824
738	10	Y-dPmzcoPZo	ฝากความยินดี - คริสติน่า อากีล่าร์ I Cover by เอย [ Sweet Hours ] #CHILLเชียงราย	https://i.ytimg.com/vi/Y-dPmzcoPZo/mqdefault.jpg	\N	Chill ChiangRai2020	41	2026-05-29 02:37:26.57613
739	10	NZ6Oal-d_Ek	รักเธอจริงๆ - สุกัญญา มิเกล I Cover by Pammy Feet. [Chicken Space] #CHILLเชียงราย	https://i.ytimg.com/vi/NZ6Oal-d_Ek/mqdefault.jpg	\N	Chill ChiangRai2020	42	2026-05-29 02:37:26.580886
740	10	eHcBpFsynnc	Scorpions - Holiday I Cover by Chill Music & Restaurant เชียงราย	https://i.ytimg.com/vi/eHcBpFsynnc/mqdefault.jpg	\N	Chill ChiangRai2020	43	2026-05-29 02:37:26.585901
741	10	dKkY9y3qpmY	รอยยิ้มนักสู้ - LOSO I Cover by Chill Music & Restaurant เชียงราย	https://i.ytimg.com/vi/dKkY9y3qpmY/mqdefault.jpg	\N	Chill ChiangRai2020	44	2026-05-29 02:37:26.590726
742	10	0K6_fDvKqQU	2 easy and groovy bass lines for beginner bass players (with playalong!)	https://i.ytimg.com/vi/0K6_fDvKqQU/mqdefault.jpg	\N	Yonit Spiegelman	45	2026-05-29 02:37:26.595919
743	10	5-34ncIkE24	อย่าให้เขารู้ - มิคกี้ I Cover by Leema [Sweet Hours] #CHILLเชียงราย	https://i.ytimg.com/vi/5-34ncIkE24/mqdefault.jpg	\N	Chill ChiangRai2020	46	2026-05-29 02:37:26.600629
744	10	h9fm1m7f8JA	ขอเพียงที่พักใจ - มาลีวัลย์ เจมีน่า I Cover by Pammy [Chicken Space]#CHILLเชียงราย	https://i.ytimg.com/vi/h9fm1m7f8JA/mqdefault.jpg	\N	Chill ChiangRai2020	47	2026-05-29 02:37:26.605082
745	10	3patzXio7RU	รวมเพลงเพราะๆ CHILLเชียงราย #EP1	https://i.ytimg.com/vi/3patzXio7RU/mqdefault.jpg	\N	Chill ChiangRai2020	48	2026-05-29 02:37:26.610109
746	10	0_UOEWKEowY	คนหลงทาง - Big Ass I Cover by เกด [ Sunset Band ]	https://i.ytimg.com/vi/0_UOEWKEowY/mqdefault.jpg	\N	Chill ChiangRai2020	49	2026-05-29 02:37:26.61437
747	10	wvJgXH2MizI	รวมเพลงฮิต Cover by Sweet Hours	https://i.ytimg.com/vi/wvJgXH2MizI/mqdefault.jpg	\N	Chill ChiangRai2020	50	2026-05-29 02:37:26.61854
748	10	cXLhhqujFZo	ลม - NUM KALA I Cover by มนตรี [ prAy ] CHILLเชียงราย	https://i.ytimg.com/vi/cXLhhqujFZo/mqdefault.jpg	\N	Chill ChiangRai2020	51	2026-05-29 02:37:26.623208
749	10	22TYpicu6DY	ถ่านไฟเก่า - เบิร์ด ธงไชย I Cover by manny [ Manny Band ] CHILLเชียงราย	https://i.ytimg.com/vi/22TYpicu6DY/mqdefault.jpg	\N	Chill ChiangRai2020	52	2026-05-29 02:37:26.62762
750	10	_Zy0B3ExegA	เธอจะเลือกใคร - วารุณี สุนทรีสวัสด์ I Cover by เอย [ Sweet Hours ] CHILLเชียงราย	https://i.ytimg.com/vi/_Zy0B3ExegA/mqdefault.jpg	\N	Chill ChiangRai2020	53	2026-05-29 02:37:26.636347
751	10	iV8Pbpw7FJg	ใครคนนั้น-พลพล I Cover by Leema [ Sweet Hours ] CHILLเชียงราย	https://i.ytimg.com/vi/iV8Pbpw7FJg/mqdefault.jpg	\N	Chill ChiangRai2020	54	2026-05-29 02:37:26.641366
752	10	3KiTWn0fQB8	ความลับ - มัม ลาโคนิค l Cover by Manny [ Manny Band ] CHILLเชียงราย	https://i.ytimg.com/vi/3KiTWn0fQB8/mqdefault.jpg	\N	Chill ChiangRai2020	55	2026-05-29 02:37:26.646639
753	10	OzZI1oJym9g	ไม่รักดี - เปเปอร์แจม I Cover by Pammy [ Chicken Space ] CHILLเชียงราย	https://i.ytimg.com/vi/OzZI1oJym9g/mqdefault.jpg	\N	Chill ChiangRai2020	56	2026-05-29 02:37:26.651993
754	10	LHx_zKOlYbk	ทางรักสีดำ- ดอน สอนระเบียบ I Cover by Leema [ Sweet Hours ] CHILLเชียงราย	https://i.ytimg.com/vi/LHx_zKOlYbk/mqdefault.jpg	\N	Chill ChiangRai2020	57	2026-05-29 02:37:26.669071
755	10	LLovE35XHLM	Talking Thailand ประจำวันที่ 29 ตุลาคม  2564	https://i.ytimg.com/vi/LLovE35XHLM/mqdefault.jpg	\N	VOICE TV	58	2026-05-29 02:37:26.674619
756	10	vRTRIgQipQY	สิ่งสำคัญ - Endorphine I Cover by เอย [Sweet Hours] CHILLเชียงราย	https://i.ytimg.com/vi/vRTRIgQipQY/mqdefault.jpg	\N	Chill ChiangRai2020	59	2026-05-29 02:37:26.679487
757	10	aAZfcrXETrc	อย่าทำให้ฟ้าผิดหวัง - Endorphine I Cover by เอย [Sweet Hours]	https://i.ytimg.com/vi/aAZfcrXETrc/mqdefault.jpg	\N	Chill ChiangRai2020	60	2026-05-29 02:37:26.684391
758	10	UY10EmuoPDo	Forza350ไฟเดิมไม่สว่าง แก้ยังไง?ให้จบ! เพื่อนแซวว่าสว่างถึงดาวอังคาร ฟิวนี้พร้อมลุยทริปชิวๆเลยค้าป!	https://i.ytimg.com/vi/UY10EmuoPDo/mqdefault.jpg	\N	Donut Rider	61	2026-05-29 02:37:26.688819
759	10	PvG1-I44rBw	LIVE เจาะลึกทั่วไทย Inside Thailand 23 พ.ย. 64	https://i.ytimg.com/vi/PvG1-I44rBw/mqdefault.jpg	\N	เจาะลึกทั่วไทย Inside Thailand	62	2026-05-29 02:37:26.694085
760	10	DWpQQYO0zWI	รีวิว New Forza 350  2022 ปรับสีใหม่ ตอนนี้มาแรงแซงพวกเลย..!!	https://i.ytimg.com/vi/DWpQQYO0zWI/mqdefault.jpg	\N	SuperBikeMag x SuperDriveMag	63	2026-05-29 02:37:26.699339
761	10	jPaomh0FB3Y	กลับกลาย - เอย [Sweet Hours]	https://i.ytimg.com/vi/jPaomh0FB3Y/mqdefault.jpg	\N	Chill ChiangRai2020	64	2026-05-29 02:37:26.705094
762	10	m4-XxhY4l7g	ขอโทษ - พงษ์สิทธิ์ คำภีร์ I Cover by Leema [ Sweet Hours ]	https://i.ytimg.com/vi/m4-XxhY4l7g/mqdefault.jpg	\N	Chill ChiangRai2020	65	2026-05-29 02:37:26.709985
763	10	GBXiAn8sXbo	Live สด 300 BAND 12/12/64	https://i.ytimg.com/vi/GBXiAn8sXbo/mqdefault.jpg	\N	Chill ChiangRai2020	66	2026-05-29 02:37:26.715708
764	10	LsvIqfPrBQM	ไม่เคย - 25hours I Cover by เอย [ Sweet Hours ]	https://i.ytimg.com/vi/LsvIqfPrBQM/mqdefault.jpg	\N	Chill ChiangRai2020	67	2026-05-29 02:37:26.721144
765	10	9Ru37AgeAQQ	รวมเพลง Cover อกหักข้ามปี เจ็บๆโดนๆ ฟังกันยาวๆ [ CHILLเชียงราย ]	https://i.ytimg.com/vi/9Ru37AgeAQQ/mqdefault.jpg	\N	Chill ChiangRai2020	68	2026-05-29 02:37:26.726255
766	10	xYaSPK3McdE	ดูโง่โง่ - เสือ ธนพล I Cover by Leema [ Sweet Hours ]	https://i.ytimg.com/vi/xYaSPK3McdE/mqdefault.jpg	\N	Chill ChiangRai2020	69	2026-05-29 02:37:26.732112
767	10	5J7aw-9DqVE	I JUST WANNA PEN FAN YOU DAI BOR ? - สิงโต นำโชค I Cover by 300BAND	https://i.ytimg.com/vi/5J7aw-9DqVE/mqdefault.jpg	\N	Chill ChiangRai2020	70	2026-05-29 02:37:26.737537
768	10	iOo3DQwYyYw	ยื้อ - เบน ชลาทิศ I Cover by แมนนี่ [ MANNY BAND ]	https://i.ytimg.com/vi/iOo3DQwYyYw/mqdefault.jpg	\N	Chill ChiangRai2020	71	2026-05-29 02:37:26.742979
769	10	fZ1T9kjr5nM	ไขปริศนาการบิน EP.13 : เครื่องบินขนอาวุธของสหรัฐตกในอัฟกานิสถาน	https://i.ytimg.com/vi/fZ1T9kjr5nM/mqdefault.jpg	\N	INTO THE BLACK BOX	72	2026-05-29 02:37:26.748522
770	10	CMfJNZSwEx4	ความในใจ - ต้อม เรนโบว์ I Cover by LEEMA [ Sweet Hours ] CHILLเชียงราย	https://i.ytimg.com/vi/CMfJNZSwEx4/mqdefault.jpg	\N	Chill ChiangRai2020	73	2026-05-29 02:37:26.753961
771	10	eGvfV6lM5q0	กองไว้ - เจ เจตริน I Cover by Kai [Chicken Space] CHILLเชียงราย	https://i.ytimg.com/vi/eGvfV6lM5q0/mqdefault.jpg	\N	Chill ChiangRai2020	74	2026-05-29 02:37:26.759112
772	10	JOik4LPxIiI	คนเลวที่รักเธอ - ปนัดดา เรืองวุฒิ I Cover by เอย [ Sweet Hours ]	https://i.ytimg.com/vi/JOik4LPxIiI/mqdefault.jpg	\N	Chill ChiangRai2020	75	2026-05-29 02:37:26.764535
773	10	TfbtJO9xU38	สาวน้อยกลับบ้าน - อ้อย กะท้อน I Cover by เอมมี่ [ prAy ] CHILLเชียงราย	https://i.ytimg.com/vi/TfbtJO9xU38/mqdefault.jpg	\N	Chill ChiangRai2020	76	2026-05-29 02:37:26.769278
774	10	fT2cFArrDts	จากนี้ไปจนนิรันดร์ - เอ๊ะ จิรากร สมพิทักษ์ I Cover by แมนนี่ [ MANNY BAND ] CHILLเชียงราย	https://i.ytimg.com/vi/fT2cFArrDts/mqdefault.jpg	\N	Chill ChiangRai2020	77	2026-05-29 02:37:26.775518
775	10	BeGqNl7_dAQ	ทั้งรักทั้งเกลียด - กุ้ง ตวงสิทธิ์ I Cover by Leema [ Sweet Hours ] CHILLเชียงราย	https://i.ytimg.com/vi/BeGqNl7_dAQ/mqdefault.jpg	\N	Chill ChiangRai2020	78	2026-05-29 02:37:26.782356
776	10	A6pRQ84rUL4	รักคือฝันไป - สาว สาว สาว I Cover by เกด [ 300BAND ] CHILLเชียงราย	https://i.ytimg.com/vi/A6pRQ84rUL4/mqdefault.jpg	\N	Chill ChiangRai2020	79	2026-05-29 02:37:26.787682
777	10	yF2LWtCn29k	คำยินดี - Klear I Cover by มีน [ Tomato ]	https://i.ytimg.com/vi/yF2LWtCn29k/mqdefault.jpg	\N	Chill ChiangRai2020	80	2026-05-29 02:37:26.793084
778	10	SDg3CFfc8cw	คิดถึงเธอ - นา'กา I Cover by เป้ feat.[Sweet Hours]	https://i.ytimg.com/vi/SDg3CFfc8cw/mqdefault.jpg	\N	Chill ChiangRai2020	81	2026-05-29 02:37:26.797742
779	10	T3D8rjfjen0	ความทรงจำ - แอม เสาวลักษณ์ I Cover by เอย [ Sweet Hours ] CHILLเชียงราย	https://i.ytimg.com/vi/T3D8rjfjen0/mqdefault.jpg	\N	Chill ChiangRai2020	82	2026-05-29 02:37:26.803302
780	10	tv28OCljz_w	เล่นของสูง - BIGASS I Cover by เอย [Sweet Hours] #CHILLเชียงราย	https://i.ytimg.com/vi/tv28OCljz_w/mqdefault.jpg	\N	Chill ChiangRai2020	83	2026-05-29 02:37:26.808138
781	10	vCC4L9LIb7c	พูดไม่ค่อยเก่ง - AB NORMAL I Cover by Leema [Sweet Hours]	https://i.ytimg.com/vi/vCC4L9LIb7c/mqdefault.jpg	\N	Chill ChiangRai2020	84	2026-05-29 02:37:26.813857
782	10	Mh61zxKd11U	I JUST WANNA PEN FAN YOU DAI BOR ? - สิงโต นำโชค I Cover by เบนซ์	https://i.ytimg.com/vi/Mh61zxKd11U/mqdefault.jpg	\N	Chill ChiangRai2020	85	2026-05-29 02:37:26.819011
783	10	HfyyC7bgZPI	STAMP : วิญญาณ Feat. พงษ์สิทธิ์ คำภีร์ I Cover by บอม The Voice Feat. LEEMA #CHILLเชียงราย #Mouth	https://i.ytimg.com/vi/HfyyC7bgZPI/mqdefault.jpg	\N	Chill ChiangRai2020	86	2026-05-29 02:37:26.824922
784	10	2Ra-QKG8y2c	ร้องไห้กับฉัน - เสือ ธนพล I Cover by Leema [ Sweet Hours ]	https://i.ytimg.com/vi/2Ra-QKG8y2c/mqdefault.jpg	\N	Chill ChiangRai2020	87	2026-05-29 02:37:26.836642
785	10	0ORIjv2wy9s	คงไม่ทัน - สงกรานต์ I Cover by บอม The voice #CHILLเชียงราย	https://i.ytimg.com/vi/0ORIjv2wy9s/mqdefault.jpg	\N	Chill ChiangRai2020	88	2026-05-29 02:37:26.841767
786	10	QyefzX6i_Gw	รวมเพลงสากลเก่าเพราะๆ by Chill Music & Restaurant	https://i.ytimg.com/vi/QyefzX6i_Gw/mqdefault.jpg	\N	Chill ChiangRai2020	89	2026-05-29 02:37:26.847013
787	10	EPz9uA07X24	LIVE เจาะลึกทั่วไทย Inside Thailand 20 พ.ค. 65	https://i.ytimg.com/vi/EPz9uA07X24/mqdefault.jpg	\N	เจาะลึกทั่วไทย Inside Thailand	90	2026-05-29 02:37:26.852252
788	10	NK2ZIqOVjIE	ยิ่งกว่าเสียใจ - พั้นช์ I Cover by เอย [Sweet Hours] CHILLเชียงราย	https://i.ytimg.com/vi/NK2ZIqOVjIE/mqdefault.jpg	\N	Chill ChiangRai2020	91	2026-05-29 02:37:26.857402
789	10	kfiAniakR9M	รวมเพลงเพราะๆ เจ๊บนี้อีกนาน by Chill Music & Restaurant	https://i.ytimg.com/vi/kfiAniakR9M/mqdefault.jpg	\N	Chill ChiangRai2020	92	2026-05-29 02:37:26.862532
790	10	sX9pvmnGugU	ฉันเลว - แอม เสาวลักษณ์ I Cover by เอย [ Sweet Hours ]	https://i.ytimg.com/vi/sX9pvmnGugU/mqdefault.jpg	\N	Chill ChiangRai2020	93	2026-05-29 02:37:26.867391
792	10	1ksRc9oI9EA	ขอมือเธอหน่อย - นันทิดา แก้วบัวสาย I Cover by เอย [ Sweet Hours ]	https://i.ytimg.com/vi/1ksRc9oI9EA/mqdefault.jpg	\N	Chill ChiangRai2020	95	2026-05-29 02:37:26.877559
793	10	11icJ0a_mcE	LIVE เจาะลึกทั่วไทย Inside Thailand 14 ก.ค. 65	https://i.ytimg.com/vi/11icJ0a_mcE/mqdefault.jpg	\N	เจาะลึกทั่วไทย Inside Thailand	96	2026-05-29 02:37:26.882862
794	10	y5bmcOqtc3U	นะหน้าทอง - โจอี้ ภูวศิษฐ์ I Cover by Leema [Sweet Hours]	https://i.ytimg.com/vi/y5bmcOqtc3U/mqdefault.jpg	\N	Chill ChiangRai2020	97	2026-05-29 02:37:26.896588
795	10	GjM11SPQERY	สหายสุรา - อ.ไข่ มาลีฮวนน่า X เนสกาแฟ ศรีนคร I Cover by เอย [ Sweet Hours ]	https://i.ytimg.com/vi/GjM11SPQERY/mqdefault.jpg	\N	Chill ChiangRai2020	98	2026-05-29 02:37:26.904789
796	10	jGvepeoikUM	ทิ้ง - Outsiders I Cover by Leema [ Sweet Hours ]	https://i.ytimg.com/vi/jGvepeoikUM/mqdefault.jpg	\N	Chill ChiangRai2020	99	2026-05-29 02:37:26.909253
797	10	oIDFDCLenS4	เงือกทอง - Cover by บอย [ หางหวายBAND ] - (Original อ่าวอันดา)	https://i.ytimg.com/vi/oIDFDCLenS4/mqdefault.jpg	\N	Chill ChiangRai2020	100	2026-05-29 02:37:26.917309
798	10	-w9yNuBXwms	คนเจ้าน้ำตา - นิว จิ๋ว I Cover by กระต่าย [ Smarn Soul - สมานโซล ]	https://i.ytimg.com/vi/-w9yNuBXwms/mqdefault.jpg	\N	Chill ChiangRai2020	101	2026-05-29 02:37:26.923262
799	10	mxSdsfo8LQw	รวมเพลงเพราะ Sweet Hours	https://i.ytimg.com/vi/mxSdsfo8LQw/mqdefault.jpg	\N	Chill ChiangRai2020	102	2026-05-29 02:37:26.927839
800	10	jf0Xznvpk9I	หมั่นคอยดูแลและรักษาดวงใจ - เบิร์ด ธงไชย I Cover by แมนนี่	https://i.ytimg.com/vi/jf0Xznvpk9I/mqdefault.jpg	\N	Chill ChiangRai2020	103	2026-05-29 02:37:26.933449
801	10	J1oFxuqaIk8	รักสามเศร้า - พริกไทย I Cover by Sara x Chicken Space [ Chill เชียงราย ]	https://i.ytimg.com/vi/J1oFxuqaIk8/mqdefault.jpg	\N	Chill ChiangRai2020	104	2026-05-29 02:37:26.938033
802	10	mPHs16B9E2A	แฟนเก็บ - ตั๊กแตน ชลดา I Cover by บีม [ Chill Music & Restaurant ]	https://i.ytimg.com/vi/mPHs16B9E2A/mqdefault.jpg	\N	Chill ChiangRai2020	105	2026-05-29 02:37:26.943275
803	10	lr9NG9wvEKg	กองไว้ - เจ เจตริน I Cover by เอย [ Sweet Hours ]	https://i.ytimg.com/vi/lr9NG9wvEKg/mqdefault.jpg	\N	Chill ChiangRai2020	106	2026-05-29 02:37:26.948316
804	10	S488V8JsiYw	ดาวประดับใจ - ดอน สอนระเบียบ I Cover by Leema [ Sweet Hours ]	https://i.ytimg.com/vi/S488V8JsiYw/mqdefault.jpg	\N	Chill ChiangRai2020	107	2026-05-29 02:37:26.954705
805	10	R0d2n7sOHTA	ผีเห็นผี - L.กฮ. I Cover by Sara [ Chicken Space ] #CHILLเชียงราย	https://i.ytimg.com/vi/R0d2n7sOHTA/mqdefault.jpg	\N	Chill ChiangRai2020	108	2026-05-29 02:37:26.959503
806	10	o5ai_Jg_gnw	ใจโทรมๆ - ไมโคร I Cover by Kai [ Chicken Space ]	https://i.ytimg.com/vi/o5ai_Jg_gnw/mqdefault.jpg	\N	Chill ChiangRai2020	109	2026-05-29 02:37:26.964523
807	10	7XL7ktHkUSc	อย่าทำอย่างนี้ไม่ว่ากับใคร - Bird Thongchai I Cover by เกด [ 300 BAND ]	https://i.ytimg.com/vi/7XL7ktHkUSc/mqdefault.jpg	\N	Chill ChiangRai2020	110	2026-05-29 02:37:26.969251
808	10	_wOpIP_88kY	รักคงยังไม่พอ : เสือ ธนพล อินทฤทธิ์ I Cover by ต้อง [ 300 BAND ]	https://i.ytimg.com/vi/_wOpIP_88kY/mqdefault.jpg	\N	Chill ChiangRai2020	111	2026-05-29 02:37:26.974516
809	10	AHVcSmpjOjU	ปราสาททราย - สุรสีห์ อิทธิกุล i Cover by เอย [ Sweet Hours ]	https://i.ytimg.com/vi/AHVcSmpjOjU/mqdefault.jpg	\N	Chill ChiangRai2020	112	2026-05-29 02:37:26.979229
810	10	VQFa7xwsHcA	อธิษฐานรัก - ต้อม เรนโบว์ I Cover by Leema [ Sweet Hours ]	https://i.ytimg.com/vi/VQFa7xwsHcA/mqdefault.jpg	\N	Chill ChiangRai2020	113	2026-05-29 02:37:26.98412
811	10	thszieldA6I	ชวนน้องล่องใต้ - (ชวนน้องเที่ยวใต้) - ลิลลี่ ได้หมดถ้าสดชื่น Cover by เกด [ 300 BAND ]	https://i.ytimg.com/vi/thszieldA6I/mqdefault.jpg	\N	Chill ChiangRai2020	114	2026-05-29 02:37:26.989554
812	10	PVVpGAl-jfc	คนนิสัยเสีย-อ้อน ลัคนา I Cover by เอย [ Sweet Hours ]	https://i.ytimg.com/vi/PVVpGAl-jfc/mqdefault.jpg	\N	Chill ChiangRai2020	115	2026-05-29 02:37:26.994594
813	10	OVxvpruAyLc	ถ้า - MR.TEAM I Cover by จ๊อบ [ Parking Area ]	https://i.ytimg.com/vi/OVxvpruAyLc/mqdefault.jpg	\N	Chill ChiangRai2020	116	2026-05-29 02:37:26.999136
814	10	7vq72ETvFGI	เพียงชายคนนี้ (ไม่ใช่ผู้วิเศษ) - เพชร โอสถานุเคราะห์ I Cover by LEEMA [Sweet Hours]	https://i.ytimg.com/vi/7vq72ETvFGI/mqdefault.jpg	\N	Chill ChiangRai2020	117	2026-05-29 02:37:27.004562
815	10	5EY_f-JcrMQ	ฉันรู้ - โบ สุนิตา I Cover by เอย [ Sweet Hours ] CHILLเชียงราย	https://i.ytimg.com/vi/5EY_f-JcrMQ/mqdefault.jpg	\N	Chill ChiangRai2020	118	2026-05-29 02:37:27.009253
816	10	NpqNxfUIiZA	ฮักกันบ่ได้ - ดอน สอนระเบียบ I Cover by ต้อง [ 300 BAND ]	https://i.ytimg.com/vi/NpqNxfUIiZA/mqdefault.jpg	\N	Chill ChiangRai2020	119	2026-05-29 02:37:27.014401
817	10	UynXFlYjegI	คบไม่ได้ - ป้าง นครินทร์ กิ่งศักดิ์ I Cover by Sara [ Chicken Space ] Chillเชียงราย	https://i.ytimg.com/vi/UynXFlYjegI/mqdefault.jpg	\N	Chill ChiangRai2020	120	2026-05-29 02:37:27.019072
818	10	igJ3WddahkI	เรนิษรา - ผู้ถูกเลือกให้ผิดหวัง (ดอกไม้ฤดูหนาว) I Cover by เอย [ Sweet Hours ]	https://i.ytimg.com/vi/igJ3WddahkI/mqdefault.jpg	\N	Chill ChiangRai2020	121	2026-05-29 02:37:27.024517
819	10	6ieG4WguIrc	รักเธอเสมอ - อัสนี วสันต์ โชติกุล I Cover by LEEMA [ Sweet Hours ] CHILLเชียงราย	https://i.ytimg.com/vi/6ieG4WguIrc/mqdefault.jpg	\N	Chill ChiangRai2020	122	2026-05-29 02:37:27.030174
820	10	MI45Xx1z9Wc	สายลม : Love Maker by am:pm เจนนิเฟอร์ คิ้ม I Cover by เอย [ Sweet Hours ]	https://i.ytimg.com/vi/MI45Xx1z9Wc/mqdefault.jpg	\N	Chill ChiangRai2020	123	2026-05-29 02:37:27.035137
821	10	Ki_7RrMPoPU	ผีเสื้อราตรี - แคทรียา อิงลิช I Cover by เกด [ 300 BAND ] CHILLเชียงราย	https://i.ytimg.com/vi/Ki_7RrMPoPU/mqdefault.jpg	\N	Chill ChiangRai2020	124	2026-05-29 02:37:27.040117
822	10	mFSDmqvFayQ	L.O.V.E. - คูณสาม ซูเปอร์แก๊งค์ I Cover by ต้อง เกด [300BAND] CHILLเชียงราย	https://i.ytimg.com/vi/mFSDmqvFayQ/mqdefault.jpg	\N	Chill ChiangRai2020	125	2026-05-29 02:37:27.045211
823	10	-fd-JExBNwY	นางฟ้ากับควาย - TAXI I Cover by Leema [ Sweet Hours ] CHILLเชียงราย	https://i.ytimg.com/vi/-fd-JExBNwY/mqdefault.jpg	\N	Chill ChiangRai2020	126	2026-05-29 02:37:27.05064
824	10	bYNlxDBAEgA	บอกสักคำ - กะลา I Cover by Leema [ Sweet Hours ] Chillเชียงราย	https://i.ytimg.com/vi/bYNlxDBAEgA/mqdefault.jpg	\N	Chill ChiangRai2020	127	2026-05-29 02:37:27.056089
825	10	voCw1C03VMc	สายเกินไป - โอเวชั่น I Cover by เอย [ Sweet Hours ]CHILLเชียงราย	https://i.ytimg.com/vi/voCw1C03VMc/mqdefault.jpg	\N	Chill ChiangRai2020	128	2026-05-29 02:37:27.061271
826	10	dNrSFiLq3Vc	แสนรัก - แจ้ ดนุพล แก้วกาญจน์ I Cover by เอย [ Sweet Hours ] CHILLเชียงราย	https://i.ytimg.com/vi/dNrSFiLq3Vc/mqdefault.jpg	\N	Chill ChiangRai2020	129	2026-05-29 02:37:27.066796
827	10	ko1NCzMzKHA	นานเท่าไรก็รอ - เสก โลโซ,เบิร์ด ธงไชย I Cover by Leema [Sweet Hours]	https://i.ytimg.com/vi/ko1NCzMzKHA/mqdefault.jpg	\N	Chill ChiangRai2020	130	2026-05-29 02:37:27.071731
828	10	DpDfqsCqTTI	ว่าว - มีนตรา อินทิรา I Cover by เอย [ Sweet Hours ]	https://i.ytimg.com/vi/DpDfqsCqTTI/mqdefault.jpg	\N	Chill ChiangRai2020	131	2026-05-29 02:37:27.076061
829	10	jB_N3VsWFdo	เมดเล่ย์ลูกทุ่งสนุกๆ By 300BAND [ CHILLเชียงราย ]	https://i.ytimg.com/vi/jB_N3VsWFdo/mqdefault.jpg	\N	Chill ChiangRai2020	132	2026-05-29 02:37:27.082809
830	10	ukYUw6xE62I	เข้าเวรรอ - ศรเพชร ศรสุพรรณ I Cover by ลูกกวาด [ 2499 BAND ]	https://i.ytimg.com/vi/ukYUw6xE62I/mqdefault.jpg	\N	Chill ChiangRai2020	133	2026-05-29 02:37:27.087374
831	10	aLcW_o4HEtE	ลองฟังแล : โต๋ เหน่อ I Cover by SARA [ Chicken Space ] CHILLเชียงราย	https://i.ytimg.com/vi/aLcW_o4HEtE/mqdefault.jpg	\N	Chill ChiangRai2020	134	2026-05-29 02:37:27.092573
832	10	KllTEcuIHUo	ไม่กล้าบอกเธอ - โจ & ก้อง I Cover by Kai [ Chicken Space ]	https://i.ytimg.com/vi/KllTEcuIHUo/mqdefault.jpg	\N	Chill ChiangRai2020	135	2026-05-29 02:37:27.097143
833	10	YXlHsTQU9L4	ด้วยรักและผูกพัน - เบิร์ด ธงไชย I Cover by Leema [ Sweet Hours ]	https://i.ytimg.com/vi/YXlHsTQU9L4/mqdefault.jpg	\N	Chill ChiangRai2020	136	2026-05-29 02:37:27.102459
834	10	HnJ5h50kxWg	มารักทำไมตอนนี้ - Am Fine I Cover by Sara [Chicken Space]	https://i.ytimg.com/vi/HnJ5h50kxWg/mqdefault.jpg	\N	Chill ChiangRai2020	137	2026-05-29 02:37:27.106717
835	10	Eh5xi74_nsc	ใจสั่งมา - LOSO I Cover by เอย [ Sweet Hours ] Chillเชียงราย	https://i.ytimg.com/vi/Eh5xi74_nsc/mqdefault.jpg	\N	Chill ChiangRai2020	138	2026-05-29 02:37:27.111817
836	10	UV6VPB9D5Ho	กอดฉัน : หญิง ธิติกานต์ I Live @ Chill Music & Restaurant	https://i.ytimg.com/vi/UV6VPB9D5Ho/mqdefault.jpg	\N	Chill ChiangRai2020	139	2026-05-29 02:37:27.116043
837	10	1scUffFxll8	เธอลำเอียง​ -​ อริสมันต์ พงษ์เรืองรอง I Cover by Leema [Sweet Hours]	https://i.ytimg.com/vi/1scUffFxll8/mqdefault.jpg	\N	Chill ChiangRai2020	140	2026-05-29 02:37:27.121194
838	10	-7piKqPvF4Q	เมื่อเขามา...ฉันจะไป - Endorphine I Cover by เอย [ Sweet Hours ] CHILLเชียงราย	https://i.ytimg.com/vi/-7piKqPvF4Q/mqdefault.jpg	\N	Chill ChiangRai2020	141	2026-05-29 02:37:27.125644
839	10	ej7SglwVD4M	เพราะเธอหรือเปล่า - ดิอินโนเซ้นท์ I Cover by อุ๋ย [ Diary Day ]CHILLเชียงราย	https://i.ytimg.com/vi/ej7SglwVD4M/mqdefault.jpg	\N	Chill ChiangRai2020	142	2026-05-29 02:37:27.131068
840	10	x-yU5UjB16U	ยิ่งใกล้ยิ่งเจ็บ - อินคา I Cover by ฟ้า CHILLเชียงราย	https://i.ytimg.com/vi/x-yU5UjB16U/mqdefault.jpg	\N	Chill ChiangRai2020	143	2026-05-29 02:37:27.136329
841	10	PovC27wUMK8	ถ้าคิดถึงเธอมากกว่านี้ - เจินเจิน บุญสูงเนิน I Cover by เอย [ Sweet Hour ]	https://i.ytimg.com/vi/PovC27wUMK8/mqdefault.jpg	\N	Chill ChiangRai2020	144	2026-05-29 02:37:27.143014
842	10	XjDsgtk_CrI	นิดหน่อย - โจอี้ ภูวศิษฐ์ I Cover by Leema [ Sweet Hours ] CHILLเชียงราย	https://i.ytimg.com/vi/XjDsgtk_CrI/mqdefault.jpg	\N	Chill ChiangRai2020	145	2026-05-29 02:37:27.14796
843	10	csXwKUB84rQ	รักเดียวใจเดียว - เสือ ธนพล I Cover by เบนซ์ [ Diary Day ]	https://i.ytimg.com/vi/csXwKUB84rQ/mqdefault.jpg	\N	Chill ChiangRai2020	146	2026-05-29 02:37:27.153115
844	10	TCPXURmB0wE	ใจเป็นนาย กายเป็นบ่าว - เล็ก รัชเมศฐ์ I Cover by Leema [ Sweet Hours ]	https://i.ytimg.com/vi/TCPXURmB0wE/mqdefault.jpg	\N	Chill ChiangRai2020	147	2026-05-29 02:37:27.15827
845	10	kn6pM3FbN30	คลื่น - PRAE CHANAA (แพร ชนา) I Cover by เอย [ Sweet Hours ]	https://i.ytimg.com/vi/kn6pM3FbN30/mqdefault.jpg	\N	Chill ChiangRai2020	148	2026-05-29 02:37:27.16414
846	10	8sdP2pcG-CU	รอวันฉันรักเธอ - คีรีบูน I Cover by Leema [ Sweet Hours ] CHILLเชียงราย	https://i.ytimg.com/vi/8sdP2pcG-CU/mqdefault.jpg	\N	Chill ChiangRai2020	149	2026-05-29 02:37:27.168816
847	10	uSx0IKleZVM	บังเอิญมันได้อ่ะ - แอน อรดี I Cover by เกด [ 300BAND ]	https://i.ytimg.com/vi/uSx0IKleZVM/mqdefault.jpg	\N	Chill ChiangRai2020	150	2026-05-29 02:37:27.174442
848	10	6JcVZPp6Pu4	รู้ไหมทำไม - มาลีวัลย์ เจมีน่า I Cover by เอย [ Sweet Hours ] CHILLเชียงราย	https://i.ytimg.com/vi/6JcVZPp6Pu4/mqdefault.jpg	\N	Chill ChiangRai2020	151	2026-05-29 02:37:27.17929
849	10	NUjANiBc3Kc	เคยรักฉันบ้างไหม - LOSO I Cover by เอย [ Sweet Hours ] Chillเชียงราย	https://i.ytimg.com/vi/NUjANiBc3Kc/mqdefault.jpg	\N	Chill ChiangRai2020	152	2026-05-29 02:37:27.184084
850	10	h4LRpUIt5QY	ปาฏิหาริย์ - กบ ทรงสิทธิ์ I Cover by Leema [ Sweet Hours ]	https://i.ytimg.com/vi/h4LRpUIt5QY/mqdefault.jpg	\N	Chill ChiangRai2020	153	2026-05-29 02:37:27.189409
851	10	3OjuzkSHYzI	ละหมาดอารมณ์ - มาลีฮวนน่า I cover by เกด [ 300 BAND ]	https://i.ytimg.com/vi/3OjuzkSHYzI/mqdefault.jpg	\N	Chill ChiangRai2020	154	2026-05-29 02:37:27.194592
855	11	jLxgMriPjyg	Soul After Six - ก้อนหินละเมอ	https://i.ytimg.com/vi/jLxgMriPjyg/mqdefault.jpg	\N	ice creamm🍦🤍	4	2026-05-29 02:37:27.583699
856	11	uPhAaYupwOk	คนมันรัก -  ไอซ์ ศรัณยู 【OFFICIAL MV】	https://i.ytimg.com/vi/uPhAaYupwOk/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	5	2026-05-29 02:37:27.588164
857	11	aA6ZdOUp3Qc	Miss Call - Senorita【OFFICIAL MV】	https://i.ytimg.com/vi/aA6ZdOUp3Qc/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	6	2026-05-29 02:37:27.593864
858	11	xGuUf4HdbJI	สันละกะยา - อานัส [Official MV]	https://i.ytimg.com/vi/xGuUf4HdbJI/mqdefault.jpg	\N	อานัส music room	7	2026-05-29 02:37:27.598518
859	11	Uxs6P7obg3I	คืนที่ดาวเต็มฟ้า - ปราโมทย์ วิเลปะนะ	https://i.ytimg.com/vi/Uxs6P7obg3I/mqdefault.jpg	\N	ปราโมทย์ วิเลปะนะ	8	2026-05-29 02:37:27.603217
860	11	SAsg0FuP2iA	กระแซะเข้ามาซิ - ใหม่ เจริญปุระ【OFFICIAL MV】	https://i.ytimg.com/vi/SAsg0FuP2iA/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	9	2026-05-29 02:37:27.60755
861	11	1iaForya1p0	กาลครั้งนึง[JUNENOM] - ปราง ปรางทิพย์【Cover】	https://i.ytimg.com/vi/1iaForya1p0/mqdefault.jpg	\N	NATHA Project	10	2026-05-29 02:37:27.612723
862	11	1ZKrUQHIzs8	RIhanna  Kiss It Better Jaydon Lewis Amapiano Remix tiktok	https://i.ytimg.com/vi/1ZKrUQHIzs8/mqdefault.jpg	\N	Local Amapiano etc.	11	2026-05-29 02:37:27.617969
864	11	UtNTD0DYc1U	เพลงปล่อยวาง - อังเปา จันทกานต์ [Cover version] Original วงสวัสดี	https://i.ytimg.com/vi/UtNTD0DYc1U/mqdefault.jpg	\N	Angpao Channel	13	2026-05-29 02:37:27.627816
865	11	hSS8Xj8WycM	เพื่อเธอ -แหวน ปวริศา	https://i.ytimg.com/vi/hSS8Xj8WycM/mqdefault.jpg	\N	Jutarat Khajeefa (kate)	14	2026-05-29 02:37:27.635064
866	11	E_a9KkVaQCY	เพื่อเธอ - Nop Ponchamni	https://i.ytimg.com/vi/E_a9KkVaQCY/mqdefault.jpg	\N	nvrt manow	15	2026-05-29 02:37:27.642672
868	11	2ckDnjREvU4	ที่ว่าง พอส	https://i.ytimg.com/vi/2ckDnjREvU4/mqdefault.jpg	\N	Sudarat Junyoy	17	2026-05-29 02:37:27.65294
869	11	XuAdG3NjNH8	รัก อัญชลี จงคดีกิจ (cover) แอร์ ภัณฑิลา	https://i.ytimg.com/vi/XuAdG3NjNH8/mqdefault.jpg	\N	MusicClay2011	18	2026-05-29 02:37:27.657884
870	11	vy-16MEvSKA	แรงบันดาลใจ : RAPTOR [Official MV]	https://i.ytimg.com/vi/vy-16MEvSKA/mqdefault.jpg	\N	rsfriends	19	2026-05-29 02:37:27.663993
871	11	LNPhshzQHEQ	งมเข็มในทะเล : Dome โดม ปกรณ์ ลัม [Official MV]	https://i.ytimg.com/vi/LNPhshzQHEQ/mqdefault.jpg	\N	rsfriends	20	2026-05-29 02:37:27.670726
872	11	-Yc8eTs2XoI	เธอไม่ขอก็จะรัก : BLACKJACK Feat. T.J. 3.2.1 [Official MV]	https://i.ytimg.com/vi/-Yc8eTs2XoI/mqdefault.jpg	\N	rsfriends	21	2026-05-29 02:37:27.675643
873	11	r0Mf_M6eEnI	[Official MV] แฟนพันธุ์ท้อ (Spy) - Timethai	https://i.ytimg.com/vi/r0Mf_M6eEnI/mqdefault.jpg	\N	welovekamikaze	22	2026-05-29 02:37:27.680772
874	11	_ACkIt53X0s	SING WITH ME ร้อง​กับซี - ฟ้ารักพ่อ (DILF) | @Badmixy	https://i.ytimg.com/vi/_ACkIt53X0s/mqdefault.jpg	\N	AmyC Channel	23	2026-05-29 02:37:27.685615
875	11	vGUHBSn2jPw	ETC ชวนมาแจม " พูดทำไม" | ตู่ ภพธร	https://i.ytimg.com/vi/vGUHBSn2jPw/mqdefault.jpg	\N	TheETCband	24	2026-05-29 02:37:27.691349
876	11	7-bYnL0m2pY	เวลา : Dome โดม ปกรณ์ ลัม [Official MV]	https://i.ytimg.com/vi/7-bYnL0m2pY/mqdefault.jpg	\N	rsfriends	25	2026-05-29 02:37:27.695859
877	11	vpxLj-y2Ttw	อยู่คนเดียว - โบ สุนิตา【OFFICIAL MV】	https://i.ytimg.com/vi/vpxLj-y2Ttw/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	26	2026-05-29 02:37:27.70067
878	11	iM3nady86cc	ETC  ชวนมาแจม "คิดถึงเธอทุกทีที่อยู่คนเดียว" l เจนนิเฟอร์ คิ้ม	https://i.ytimg.com/vi/iM3nady86cc/mqdefault.jpg	\N	TheETCband	27	2026-05-29 02:37:27.705417
879	11	LVESfjCCwKo	ถ้าตลอดกาลมีจริงขอให้มันเกิดกับรักครั้งนี้ - mintchyy x marr team | “เพลง marr” EP6	https://i.ytimg.com/vi/LVESfjCCwKo/mqdefault.jpg	\N	marr team official	28	2026-05-29 02:37:27.710805
880	11	pxGM_TOgHuM	LISA - MOONLIT FLOOR (Official Performance Video)	https://i.ytimg.com/vi/pxGM_TOgHuM/mqdefault.jpg	\N	LLOUD Official	29	2026-05-29 02:37:27.715935
881	11	I0xW3yv-83U	สวนทาง : Lift&Oil | LIFT&OIL Happy Party Concert [Live Concert]	https://i.ytimg.com/vi/I0xW3yv-83U/mqdefault.jpg	\N	rsfriends	30	2026-05-29 02:37:27.721242
882	11	RGqNoQL6L0Y	Yesterday once more เนื้อเพลง+แปล	https://i.ytimg.com/vi/RGqNoQL6L0Y/mqdefault.jpg	\N	หนุ่ย ใจสอาด	31	2026-05-29 02:37:27.726368
883	11	I-wMZiEjo3Q	หมดห่วง - มินตรา น่านเจ้า【Cover Version】	https://i.ytimg.com/vi/I-wMZiEjo3Q/mqdefault.jpg	\N	Mintra Channel	32	2026-05-29 02:37:27.731956
884	11	7w9C35CZIqY	ดาวประดับใจ - ฝน ธนสุนทร [OFFICIAL MV]	https://i.ytimg.com/vi/7w9C35CZIqY/mqdefault.jpg	\N	Sure Entertainment	33	2026-05-29 02:37:27.73678
885	11	3mYVyVY-lU4	คู่ชีวิต - COCKTAIL「Official MV (Cut Version)」	https://i.ytimg.com/vi/3mYVyVY-lU4/mqdefault.jpg	\N	Genierock	34	2026-05-29 02:37:27.742415
886	11	CImLmrjctik	พอแล้วหัวใจ - เจนนี่ ได้หมดถ้าสดชื่น [เนื้อเพลง]	https://i.ytimg.com/vi/CImLmrjctik/mqdefault.jpg	\N	MusicStation4u DM	35	2026-05-29 02:37:27.747357
887	11	_GpRszA5otE	อาวเล็ท เลาจ์ Owlet Lounge ft.UrboyTJ - ฟ้าสีจาง (Time Lapse) [Live Session]	https://i.ytimg.com/vi/_GpRszA5otE/mqdefault.jpg	\N	PartyPunch Records	36	2026-05-29 02:37:27.753026
888	11	L87G-l5e358	หยุดตรงนี้ที่เธอ	https://i.ytimg.com/vi/L87G-l5e358/mqdefault.jpg	\N	Parn Thanaporn - Topic	37	2026-05-29 02:37:27.757398
889	11	bzRsu4rJwcU	อยู่ไปเพื่อใคร(ผู้หญิงข้าใครอย่าแตะ) - อนุธิดา กองราพงษ์ 🎶🍃	https://i.ytimg.com/vi/bzRsu4rJwcU/mqdefault.jpg	\N	คน เทา เทา	38	2026-05-29 02:37:27.762189
890	11	FAanGYZjO6U	อย่าปล่อยมือ - ไม้เมือง【OFFICIAL MV】	https://i.ytimg.com/vi/FAanGYZjO6U/mqdefault.jpg	\N	GRAMMY GOLD OFFICIAL	39	2026-05-29 02:37:27.766231
891	11	tICntBmpoNs	รวมเพลง: ไม้เมือง สายลมแห่งความคิดถึง [อย่าปล่อยมือ, ขอเดินด้วยคน, คำสัญญาที่หาดใหญ่]	https://i.ytimg.com/vi/tICntBmpoNs/mqdefault.jpg	\N	GRAMMY GOLD OFFICIAL	40	2026-05-29 02:37:27.770427
1544	15	AJ7ZGgIhIWo	เจ็บให้พัง - KLEAR「Official MV」	https://i.ytimg.com/vi/AJ7ZGgIhIWo/mqdefault.jpg	\N	Genierock	2	2026-05-30 04:08:34.94696
892	11	-BEHPRP-Kig	เหตุเกิดจากความเหงา | Emotion Town - (เนื้อเพลง)	https://i.ytimg.com/vi/-BEHPRP-Kig/mqdefault.jpg	\N	THE`MOVE LYRICS	41	2026-05-29 02:37:27.774639
893	11	g-DDXnl2jDM	★ Ŀ☼√Ξ★ 張靚穎 - 畫心 電影畫皮插曲 ★ Ŀ☼√Ξ★	https://i.ytimg.com/vi/g-DDXnl2jDM/mqdefault.jpg	\N	Kuo Ysh	42	2026-05-29 02:37:27.779265
894	11	js16fF3Y-I8	จูบ KISS | แสนรักโป๊ปเบลล่า	https://i.ytimg.com/vi/js16fF3Y-I8/mqdefault.jpg	\N	PB Baansanrak	43	2026-05-29 02:37:27.7837
895	11	U-XGnDwuykE	URBOYTJ - SELFMADE FT. VIOLETTE WAUTIER - OFFICIAL VISUALIZER	https://i.ytimg.com/vi/U-XGnDwuykE/mqdefault.jpg	\N	URBOYTJ	44	2026-05-29 02:37:27.787846
896	11	Tu0GeFeVAPE	วันที่ได้คำตอบ - มีนตรา อินทิรา【Cover Version】	https://i.ytimg.com/vi/Tu0GeFeVAPE/mqdefault.jpg	\N	มีนตรา อินทิรา OFFICIAL	45	2026-05-29 02:37:27.792177
897	11	4t9lmYxy1DQ	ผู้หญิงข้าใครอย่าแตะ 1 [ 天若有情] : อิ๋ว พิมพ์โพยม เรืองโรจน์	https://i.ytimg.com/vi/4t9lmYxy1DQ/mqdefault.jpg	\N	เล่ามา อาร์ตี้	46	2026-05-29 02:37:27.796671
898	11	wxh_y-hVFlU	แอนเดรีย : สบตา อัลบั้ม : Greatest Hits [Official MV] เพลงฮิตยุค90	https://i.ytimg.com/vi/wxh_y-hVFlU/mqdefault.jpg	\N	Kita Music	47	2026-05-29 02:37:27.801134
899	11	x6WCwh_wpMU	SAMBLACK - นานเท่าไหร่ (Official Video)	https://i.ytimg.com/vi/x6WCwh_wpMU/mqdefault.jpg	\N	Warmlight	48	2026-05-29 02:37:27.806248
900	11	aAkxfopxHEQ	ZEAL - จูบลา  (พ.ศ.2547)	https://i.ytimg.com/vi/aAkxfopxHEQ/mqdefault.jpg	\N	WHENWASYOUNG	49	2026-05-29 02:37:27.813068
902	11	m-exoVKHWTQ	ไม่สำคัญ - ซาร่า | เจอกับตัวเองถึงรู้, เรื่องง่ายๆที่ผู้ชายไม่รู้ | (เนื้อเพลง)	https://i.ytimg.com/vi/m-exoVKHWTQ/mqdefault.jpg	\N	TMY Music	51	2026-05-29 02:37:27.823842
905	11	zYbkwBMVtEM	ถ้าคิดถึงเธอมากกว่านี้ - เจินเจิน บุญสูงเนิน covered by Owlet	https://i.ytimg.com/vi/zYbkwBMVtEM/mqdefault.jpg	\N	Matcha Latte Studio	54	2026-05-29 02:37:27.838047
906	11	Mx92lTYxrJQ	The Weeknd, JENNIE, Lily-Rose Depp - One Of The Girls (Official Video)	https://i.ytimg.com/vi/Mx92lTYxrJQ/mqdefault.jpg	\N	TheWeekndVEVO	55	2026-05-29 02:37:27.842945
907	11	ZLeYLV73rmA	การเดินทาง - ชาติ สุชาติ  ( เนื้อเพลง )	https://i.ytimg.com/vi/ZLeYLV73rmA/mqdefault.jpg	\N	Lyrics Thailand	56	2026-05-29 02:37:27.847904
908	11	UB61lDp89jo	Deleted video		\N		57	2026-05-29 02:37:27.85409
909	11	ViZmg4WGqrE	SARAN - ใจพัง feat. GTK (Official MV)	https://i.ytimg.com/vi/ViZmg4WGqrE/mqdefault.jpg	\N	SARAN	58	2026-05-29 02:37:27.858861
911	11	Wx1jNRHoKyo	กอดจูบลูบคลำ -  L.กฮ. | TMG OFFICIAL MV	https://i.ytimg.com/vi/Wx1jNRHoKyo/mqdefault.jpg	\N	TMG Record Channel	60	2026-05-29 02:37:27.869205
912	11	ASES5-J4Br0	L.กฮ. รวมฮิต 1,000 ล้านวิว | TMG RECORD OFFICIAL MV	https://i.ytimg.com/vi/ASES5-J4Br0/mqdefault.jpg	\N	TMG Record Channel	61	2026-05-29 02:37:27.874348
913	11	EmqoH2CN--E	ผู้ถูกเลือกให้ผิดหวัง -  (Y2Rock​Y2Play ​Live​ Session​EP.2)	https://i.ytimg.com/vi/EmqoH2CN--E/mqdefault.jpg	\N	Y2Rock 	62	2026-05-29 02:37:27.879675
914	11	YxLKf0GyHTI	ทำไมต้องรักเธอ	https://i.ytimg.com/vi/YxLKf0GyHTI/mqdefault.jpg	\N	Earn Piyada - Topic	63	2026-05-29 02:37:27.886543
915	11	lHSoPQmRRa4	รัก - อัญชลี จงคดีกิจ | Acoustic Cover By Kanomroo x ZaadOat	https://i.ytimg.com/vi/lHSoPQmRRa4/mqdefault.jpg	\N	ZaadOat Studio	64	2026-05-29 02:37:27.89164
916	11	5MtesqJ0I1c	คบซ้อน - วงL.กฮ. [ Official MV ]	https://i.ytimg.com/vi/5MtesqJ0I1c/mqdefault.jpg	\N	TMG Record Channel	65	2026-05-29 02:37:27.896375
917	11	wS2EZwynFdo	รักไปแล้ว - แบงค์ โมเดิร์น X FFIN  「Official MV」	https://i.ytimg.com/vi/wS2EZwynFdo/mqdefault.jpg	\N	STICKER MUSIC	66	2026-05-29 02:37:27.901105
918	11	UGtm3YuLzPw	ติดกลิ่น - JACK & CO. (Cover by Palm)	https://i.ytimg.com/vi/UGtm3YuLzPw/mqdefault.jpg	\N	PALM	67	2026-05-29 02:37:27.906224
919	11	UJ4ye_0Hyk4	เอิร์น จิรวรรณ : ฉันคิดถึงเธอ (Ost.หวานใจ)	https://i.ytimg.com/vi/UJ4ye_0Hyk4/mqdefault.jpg	\N	KITA Chanel	68	2026-05-29 02:37:27.911484
920	11	iRCb_PodGfQ	[Official MV] รักฉันเรียกว่าเธอ : ALL KAMIKAZE	https://i.ytimg.com/vi/iRCb_PodGfQ/mqdefault.jpg	\N	welovekamikaze	69	2026-05-29 02:37:27.915911
921	11	zw6FMR4zKgU	[Official MV] ฝากไว้อีกวัน : Waii	https://i.ytimg.com/vi/zw6FMR4zKgU/mqdefault.jpg	\N	welovekamikaze	70	2026-05-29 02:37:27.920932
924	11	y6QBaZHltJw	Blondie- Call me	https://i.ytimg.com/vi/y6QBaZHltJw/mqdefault.jpg	\N	Romina Valeria	73	2026-05-29 02:37:27.936035
925	11	jlL_oWSIC5o	Soul After Six - ก้อนหินละเมอ (Official Lyric Video)	https://i.ytimg.com/vi/jlL_oWSIC5o/mqdefault.jpg	\N	SoulAfterSixVEVO	74	2026-05-29 02:37:27.94109
926	11	8wncZOX32EE	รัก | ปุ๊ อัญชลี  x TorSaksit (Piano & i Live)	https://i.ytimg.com/vi/8wncZOX32EE/mqdefault.jpg	\N	TorBright Channel	75	2026-05-29 02:37:27.946166
927	11	1Z6Zi47U6yg	So Good - Pam Anshisa【Official MV】	https://i.ytimg.com/vi/1Z6Zi47U6yg/mqdefault.jpg	\N	Pam Anshisa	76	2026-05-29 02:37:27.95142
928	11	b_z0Ttwkhlk	ไม่มีอะไรจริงๆ -  ศิลปิน เบบี้ บูล - (เนื้อเพลง) เพลงยุค90-ยุค2000	https://i.ytimg.com/vi/b_z0Ttwkhlk/mqdefault.jpg	\N	EBA-MUSIC	77	2026-05-29 02:37:27.95677
929	11	2oQn6ytAvyU	คนในฝัน (ละครฝันเฟื่อง) - MR.TEAM【OFFICIAL MV】	https://i.ytimg.com/vi/2oQn6ytAvyU/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	78	2026-05-29 02:37:27.963033
930	11	iAzGrrBp1F0	ผิงไฟ - อภิรมย์ Audio [ Cover - Mostinn ]	https://i.ytimg.com/vi/iAzGrrBp1F0/mqdefault.jpg	\N	NEWS	79	2026-05-29 02:37:27.96819
931	11	iOwzSG0pvm4	Hurry up!	https://i.ytimg.com/vi/iOwzSG0pvm4/mqdefault.jpg	\N	JayQ - Topic	80	2026-05-29 02:37:27.97302
932	11	RVQnhT0drQc	JayQ - HURRY UP! ft. 7Vibes (Official Visualizer)	https://i.ytimg.com/vi/RVQnhT0drQc/mqdefault.jpg	\N	JayQ	81	2026-05-29 02:37:27.977396
933	11	yBUBigL1Xgs	ทุกเวลา - อั้ส the star ost. บ้านนี้มีรัก (เนื้อเพลง)	https://i.ytimg.com/vi/yBUBigL1Xgs/mqdefault.jpg	\N	Vii Vivid	82	2026-05-29 02:37:27.982446
934	11	m0a417ckWb0	มาทันเวลาพอดี (Ost. Ugly Duckling รักนะเป็ดโง่) - มุก วรนิษฐ์【OFFICIAL MV】	https://i.ytimg.com/vi/m0a417ckWb0/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	83	2026-05-29 02:37:27.987159
935	11	8-Z9O46Jhio	อยู่คนเดียว - โบ สุนิตา ลีติกุล	https://i.ytimg.com/vi/8-Z9O46Jhio/mqdefault.jpg	\N	Opor Ok	84	2026-05-29 02:37:28.005256
936	11	BU9Q8KqSMqI	คิดถึงเธอทุกที(ที่อยู่คนเดียว) - เจนนิเฟอร์ คิ้ม	https://i.ytimg.com/vi/BU9Q8KqSMqI/mqdefault.jpg	\N	DUDE	85	2026-05-29 02:37:28.021917
937	11	YQHH-KW-SFo	ภวังค์จิต[ปู่จ๋าน ลองไมค์] - ปราง ปรางทิพย์【Cover】	https://i.ytimg.com/vi/YQHH-KW-SFo/mqdefault.jpg	\N	NATHA Project	86	2026-05-29 02:37:28.027419
938	11	Jvi5NCRCKqM	ลัดป่าฝ่าดง - Ta Noppawit  [ Official MV ]	https://i.ytimg.com/vi/Jvi5NCRCKqM/mqdefault.jpg	\N	Ta noppawit	87	2026-05-29 02:37:28.032689
939	11	Dvd6Q3GyLb0	ป่าลั่น - สุเทพ วงศ์กำแหง [ Official Audio ]	https://i.ytimg.com/vi/Dvd6Q3GyLb0/mqdefault.jpg	\N	ลูกกรุงอภิมหาอมตะนิรันดร์กาล	88	2026-05-29 02:37:28.037193
940	11	Kqek0BaVmO0	ป่าลั่น : สุเทพ ประยูรพิทักษ์	https://i.ytimg.com/vi/Kqek0BaVmO0/mqdefault.jpg	\N	วิทวัส สระทองคำ	89	2026-05-29 02:37:28.041867
941	11	W8yQzH7LPgo	อีกสักกี่ครั้ง-Stamp by Jane Nirinya (On my wedding day❤️)	https://i.ytimg.com/vi/W8yQzH7LPgo/mqdefault.jpg	\N	Jane Nirinya	90	2026-05-29 02:37:28.046239
942	11	PPKW7jILvbk	ที่คิดถึง...เพราะรักเธอใช่ไหม - มัดหมี่ พิมดาว | The Wall Song ร้องข้ามกำแพง	https://i.ytimg.com/vi/PPKW7jILvbk/mqdefault.jpg	\N	WorkpointOfficial	91	2026-05-29 02:37:28.050378
944	11	_cAhKWvc8WQ	Tobii - Bad Girls Like You (Official English Lyric Video)	https://i.ytimg.com/vi/_cAhKWvc8WQ/mqdefault.jpg	\N	Tobii	93	2026-05-29 02:37:28.060206
945	11	AKlaQw7wDoc	DARKANASE, JXNDRO - MONTAGEM FUERZA (Official Visualizer)	https://i.ytimg.com/vi/AKlaQw7wDoc/mqdefault.jpg	\N	DARKANASE	94	2026-05-29 02:37:28.064822
946	11	Vc3HW2uoMZ8	STEREO LOVE FUNK🎶 [Brazilian Phonk]	https://i.ytimg.com/vi/Vc3HW2uoMZ8/mqdefault.jpg	\N	Zevven	95	2026-05-29 02:37:28.069017
947	11	1TO48Cnl66w	Dido - Thank You (Official Video)	https://i.ytimg.com/vi/1TO48Cnl66w/mqdefault.jpg	\N	DidoVEVO	96	2026-05-29 02:37:28.073315
948	11	s3nTRJNhujc	Pranav P3rcy - "Starboy - Remix"	https://i.ytimg.com/vi/s3nTRJNhujc/mqdefault.jpg	\N	Pranav P3rcy	97	2026-05-29 02:37:28.077241
949	11	ITMN7-kqnj8	ยังยินดีครับเพื่อน - U.H.T.  【OFFICIAL MV】	https://i.ytimg.com/vi/ITMN7-kqnj8/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	98	2026-05-29 02:37:28.082096
950	11	eWtACIYXtoY	ไม่มีอะไรจริงๆ : Baby Bull [Official MV]	https://i.ytimg.com/vi/eWtACIYXtoY/mqdefault.jpg	\N	rsfriends	99	2026-05-29 02:37:28.086456
951	11	hvBm3Me3VRg	🌅 Sunset by the Ocean | เพลงรักชิล ๆ ฟังเพลินต่อเนื่อง 1 ชั่วโมง | Chill Relax Mix	https://i.ytimg.com/vi/hvBm3Me3VRg/mqdefault.jpg	\N	TPNJukebox	100	2026-05-29 02:37:28.091203
952	11	kPJZ0UihBfk	F.HERO Ft. JSPKK x ลำไย ไหทองคำ x M-PEE - ไม่สนิทบิดหมด (Thai Riders Anthem) [Official MV]	https://i.ytimg.com/vi/kPJZ0UihBfk/mqdefault.jpg	\N	FHERO Official	101	2026-05-29 02:37:28.096243
953	11	HlFN3T70dSw	คิดถึง..อีกแล้ว - ปุ๊กปิ๊ก กิตติยา 【OFFICIAL MV】	https://i.ytimg.com/vi/HlFN3T70dSw/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	102	2026-05-29 02:37:28.101247
954	11	7y2MfQyuNsk	BADMIXY - Just For You [เนื้อเพลง]	https://i.ytimg.com/vi/7y2MfQyuNsk/mqdefault.jpg	\N	90's Lyrics	103	2026-05-29 02:37:28.105851
955	11	eq8Qx1q81fA	กบ - หวิว | cover by Songkarn x Knomjean [ฝืน Season 1]	https://i.ytimg.com/vi/eq8Qx1q81fA/mqdefault.jpg	\N	Double Mass	104	2026-05-29 02:37:28.110787
956	11	QZgMny6ZBHI	ลืมไปก่อน	https://i.ytimg.com/vi/QZgMny6ZBHI/mqdefault.jpg	\N	Buddha Bless - Topic	105	2026-05-29 02:37:28.116394
957	11	g28KnYVHQGQ	จีบ…(May I ?) - แหนม รณเดช [Official MV]	https://i.ytimg.com/vi/g28KnYVHQGQ/mqdefault.jpg	\N	Move Records	106	2026-05-29 02:37:28.121589
958	11	y5bWzxkHOHg	คำตอบ นายสะอาด	https://i.ytimg.com/vi/y5bWzxkHOHg/mqdefault.jpg	\N	PhaiOnel Entertainment	107	2026-05-29 02:37:28.127189
959	11	hxeQk7bS_8U	คิดถึงเธอ : Raptor [Official MV]	https://i.ytimg.com/vi/hxeQk7bS_8U/mqdefault.jpg	\N	rsfriends	108	2026-05-29 02:37:28.132794
960	11	Ec3ASI2_qww	The Peach Band - วอน	https://i.ytimg.com/vi/Ec3ASI2_qww/mqdefault.jpg	\N	ThePeachBandVEVO	109	2026-05-29 02:37:28.137187
961	11	bdM1EO5LHt4	Shania Twain - I'm Gonna Getcha Good! (Performance Version) (Official Music Video)	https://i.ytimg.com/vi/bdM1EO5LHt4/mqdefault.jpg	\N	ShaniaTwainVEVO	110	2026-05-29 02:37:28.142642
962	11	51pBgYa2UEc	#มาแรงในTikTok ( ที่ผ่านมาขอบใจจริงๆ - LITTLE JOHN ) ถ้าหากว่าวันพรุ่งนี้ V.แดนซ์ยกล้อ PzRemix X2	https://i.ytimg.com/vi/51pBgYa2UEc/mqdefault.jpg	\N	PzRemix X2	111	2026-05-29 02:37:28.1471
963	11	rmUBcfLrl88	Number One - BANKK CASH feat.หญิงลี 【OFFICIAL MV】	https://i.ytimg.com/vi/rmUBcfLrl88/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	112	2026-05-29 02:37:28.151622
964	11	w2stsMkHlO0	แอวลั่นปัด	https://i.ytimg.com/vi/w2stsMkHlO0/mqdefault.jpg	\N	ปริม ลายไทย - Topic	113	2026-05-29 02:37:28.15624
965	11	frSFgYJaN0Y	สวยขยี้ใจ	https://i.ytimg.com/vi/frSFgYJaN0Y/mqdefault.jpg	\N	บุ๊ค ศุภกาญจน์ - Topic	114	2026-05-29 02:37:28.161856
966	11	bREp0BIgMz0	ไหง่ง่อง - ตั๊กแตน ชลดา【LYRIC VIDEO】	https://i.ytimg.com/vi/bREp0BIgMz0/mqdefault.jpg	\N	GRAMMY GOLD OFFICIAL	115	2026-05-29 02:37:28.166198
967	11	zvhmCLqndlQ	อยากรู้...แต่ไม่อยากถาม - Calories Blah Blah【OFFICIAL MV】	https://i.ytimg.com/vi/zvhmCLqndlQ/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	116	2026-05-29 02:37:28.170833
968	11	XhE8yELg1e8	ฝันที่แปลว่าเธอ (เพลงจากละคร...	https://i.ytimg.com/vi/XhE8yELg1e8/mqdefault.jpg	\N	Gun Napat - Topic	117	2026-05-29 02:37:28.175434
969	11	uFanfwvpM6Y	บ่โสดบ่อนุญาตให้จีบ - ปลาย กนกพร【OFFICIAL MV】	https://i.ytimg.com/vi/uFanfwvpM6Y/mqdefault.jpg	\N	GRAMMY GOLD OFFICIAL	118	2026-05-29 02:37:28.180388
970	11	qXxlnIqoK6w	บังเอิญมันได้อ่ะ - แอน อรดี [ Live Concert ] | งานกาชาดจังหวัดกาฬสินธุ์	https://i.ytimg.com/vi/qXxlnIqoK6w/mqdefault.jpg	\N	แอน อรดี official	119	2026-05-29 02:37:28.184738
971	11	e5IOVE8GMFQ	BLVCKHEART - อยากจะกอดเธอนาน ๆ  (เนื้อเพลง)	https://i.ytimg.com/vi/e5IOVE8GMFQ/mqdefault.jpg	\N	JACK WRTK	120	2026-05-29 02:37:28.189042
972	11	U7vTpU59aUg	รักเธอคนเดียว (ONE LOVE) -ณัฐ ศักดาทร 【OFFICIAL LYRICS VIDEO】	https://i.ytimg.com/vi/U7vTpU59aUg/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	121	2026-05-29 02:37:28.195084
973	11	j0O7A-A_tm0	หวาน - CELLs	https://i.ytimg.com/vi/j0O7A-A_tm0/mqdefault.jpg	\N	sowait zaas	122	2026-05-29 02:37:28.200197
974	11	P-QODbEru1o	ระยะห่าง OST.ลิขิตรัก The Crown Princess | แม็กซ์  เจนมานะ | Official MV	https://i.ytimg.com/vi/P-QODbEru1o/mqdefault.jpg	\N	Ch3Thailand Music	123	2026-05-29 02:37:28.204834
975	11	cNtP9-hQU6k	ไม่มีเหตุผล : ดัง พันกร Dunk [Official Lyric Video]	https://i.ytimg.com/vi/cNtP9-hQU6k/mqdefault.jpg	\N	rsfriends	124	2026-05-29 02:37:28.209932
976	11	a_FtDcZg2f8	สิ่งมีชีวิต	https://i.ytimg.com/vi/a_FtDcZg2f8/mqdefault.jpg	\N	Diana Rand - Topic	125	2026-05-29 02:37:28.214794
977	11	sxKr1xwhCwY	อย่ารักเขาได้ไหม	https://i.ytimg.com/vi/sxKr1xwhCwY/mqdefault.jpg	\N	โดม ปกรณ์ ลัม - Topic	126	2026-05-29 02:37:28.219445
978	11	xD_gvWKnvLs	รักเดียวของเจนจิรา..เพราะมีเธอ	https://i.ytimg.com/vi/xD_gvWKnvLs/mqdefault.jpg	\N	Love Enjoy	127	2026-05-29 02:37:28.224841
979	11	WFAYekX4s9I	ฉันรักเธอ - ทาทา ยัง 【OFFICIAL MV】	https://i.ytimg.com/vi/WFAYekX4s9I/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	128	2026-05-29 02:37:28.229392
980	11	Sxf9DdQhxCc	ในสายลม : เอ๊ะ ศศิกานต์ [Official MV]	https://i.ytimg.com/vi/Sxf9DdQhxCc/mqdefault.jpg	\N	rsfriends	129	2026-05-29 02:37:28.234612
981	11	o1821AhmYfE	วันที่อ่อนแอ - NJoinPlay [Official Lyric Video]	https://i.ytimg.com/vi/o1821AhmYfE/mqdefault.jpg	\N	N Join Play	130	2026-05-29 02:37:28.239196
982	11	G-KfJKLUq4g	ละลาย - Fora Kwan x KT Long Flowing (เนื้อเพลง)	https://i.ytimg.com/vi/G-KfJKLUq4g/mqdefault.jpg	\N	Doble A nc Beats	131	2026-05-29 02:37:28.243895
983	11	djb3SfBxars	เด็กเสเพล - ต๊ะ..ฌานิศ ใหญ่เสมอ	https://i.ytimg.com/vi/djb3SfBxars/mqdefault.jpg	\N	Wuttikorn Sritala	132	2026-05-29 02:37:28.248437
984	11	PT7GPaGJ1hc	ณัฐ ศักดาทร feat. แก้ว ZAZA - คิดถึงดังดัง (Official Video) | Nat Sakdatorn	https://i.ytimg.com/vi/PT7GPaGJ1hc/mqdefault.jpg	\N	Album 361 NAT SAKDATORN	133	2026-05-29 02:37:28.253519
985	11	K93gGFMtZTQ	อยู่คนเดียว - เบิร์ด ธงไชย (Official Music Video)	https://i.ytimg.com/vi/K93gGFMtZTQ/mqdefault.jpg	\N	Bird Thongchai	134	2026-05-29 02:37:28.257933
986	11	K93gGFMtZTQ	อยู่คนเดียว - เบิร์ด ธงไชย (Official Music Video)	https://i.ytimg.com/vi/K93gGFMtZTQ/mqdefault.jpg	\N	Bird Thongchai	135	2026-05-29 02:37:28.262232
987	11	JH1Wmi81dOk	ศรัทธา Rock for Life หงา-โป่ง	https://i.ytimg.com/vi/JH1Wmi81dOk/mqdefault.jpg	\N	tassapon	136	2026-05-29 02:37:28.266964
988	11	wEwFFxVwlss	อยู่ที่เรียนรู้ Live And Learn	https://i.ytimg.com/vi/wEwFFxVwlss/mqdefault.jpg	\N	Lookdin '  Thiaokin Paithua '	137	2026-05-29 02:37:28.273062
989	11	qseSL4orgUA	ถ้าถามว่ารักมันคืออะไร-NEW DAY PROJECT | OFFICIAL MUSIC AUDIO	https://i.ytimg.com/vi/qseSL4orgUA/mqdefault.jpg	\N	NEW DAY PROJECT	138	2026-05-29 02:37:28.277475
990	11	g_LtZn7-__0	The Right Kind Of Wrong	https://i.ytimg.com/vi/g_LtZn7-__0/mqdefault.jpg	\N	LeAnn Rimes - Topic	139	2026-05-29 02:37:28.282735
991	11	17ezE33n4QY	ใจละเมอ : ปลื้ม [Official MV]	https://i.ytimg.com/vi/17ezE33n4QY/mqdefault.jpg	\N	rsfriends	140	2026-05-29 02:37:28.287368
992	11	ZCJ6kpm0tjc	ใจเธอกอดใคร - Neo-X [Official MV]	https://i.ytimg.com/vi/ZCJ6kpm0tjc/mqdefault.jpg	\N	rsfriends	141	2026-05-29 02:37:28.292821
993	11	ZjQxGAY585Q	คนๆนี้จะไม่ไปจากเธอ : Soul Out [Official MV]	https://i.ytimg.com/vi/ZjQxGAY585Q/mqdefault.jpg	\N	rsfriends	142	2026-05-29 02:37:28.297901
994	12	yq8cs4Ni3DA	[1 hr] Playlist เพลงบรรเลงไทยแจ๊ส เปิดฟังสบายๆ คลอไว้ในร้านกาแฟ | Coffee & Smooth Jazz BGM	https://i.ytimg.com/vi/yq8cs4Ni3DA/mqdefault.jpg	\N	GMM สบาย สบาย	1	2026-05-29 02:37:43.42018
995	12	tcUzBbNTDls	[1 hr] Playlist ดนตรีบรรเลง เพลงเพราะๆ เปิดคลอๆ ในคาเฟ่ | Coffee & Bossa Nova BGM	https://i.ytimg.com/vi/tcUzBbNTDls/mqdefault.jpg	\N	GMM สบาย สบาย	2	2026-05-29 02:37:43.425533
996	12	_4kUuQndBR4	ดนตรีบรรเลงร้านกาแฟ เพลงไทยเปิดคลอๆในคาเฟ่ | Thai Cafe Jazz Playlist	https://i.ytimg.com/vi/_4kUuQndBR4/mqdefault.jpg	\N	GMM สบาย สบาย	3	2026-05-29 02:37:43.430138
997	12	C7CDg-tMVXk	ดนตรีบรรเลง เพลงร้านกาแฟฟังเพลินๆ #ฟังเพลงออนไลน์  | Café BGM Playlist	https://i.ytimg.com/vi/C7CDg-tMVXk/mqdefault.jpg	\N	GMM สบาย สบาย	4	2026-05-29 02:37:43.434779
998	12	a6aUv49JUJk	ดนตรีบรรเลง เปิดเพลงสร้างฟีลในร้านกาแฟ | Café Music Playlist	https://i.ytimg.com/vi/a6aUv49JUJk/mqdefault.jpg	\N	GMM สบาย สบาย	5	2026-05-29 02:37:43.439098
999	12	fzdR6wx1GFI	รวมเพลงบรรเลงเพราะๆ เปิดคลอในคาเฟ่ ฟังยาวๆ เพราะมากๆ #LONGPLAY	https://i.ytimg.com/vi/fzdR6wx1GFI/mqdefault.jpg	\N	GMM สบาย สบาย	6	2026-05-29 02:37:43.443547
1000	12	87PU66qzaak	รวมเพลงรักรุ่นเก่า ฟังเพลินๆ | แจ๊สไทยบรรเลง [LONGPLAY]	https://i.ytimg.com/vi/87PU66qzaak/mqdefault.jpg	\N	GMM สบาย สบาย	7	2026-05-29 02:37:43.447751
1001	12	XlHr347xPU4	แจ๊สบรรเลงเพราะๆ เปิดคลอไว้ในคาเฟ่ | Coffee Jazz Music #LONGPLAY	https://i.ytimg.com/vi/XlHr347xPU4/mqdefault.jpg	\N	GMM สบาย สบาย	8	2026-05-29 02:37:43.452957
1002	12	h80JicyqeQY	ฟังเพลงเก่าเพราะๆ ฟังไป จิบกาแฟไป | Thai Songs for Café	https://i.ytimg.com/vi/h80JicyqeQY/mqdefault.jpg	\N	GMM สบาย สบาย	9	2026-05-29 02:37:43.457126
1545	15	cEeUFE6tRmQ	คำยินดี (Kum Yin Dee) - Klear [Official MV]	https://i.ytimg.com/vi/cEeUFE6tRmQ/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	3	2026-05-30 04:08:34.952246
1003	12	nT_v4992M0Y	ดนตรีฟังสบายๆ ในร้านกาแฟ | Smooth Jazz | Bossa Cafe Music	https://i.ytimg.com/vi/nT_v4992M0Y/mqdefault.jpg	\N	GMM สบาย สบาย	10	2026-05-29 02:37:43.461337
1004	12	ZQSD7roU5Oo	เพลงบรรเลงเพราะๆ ฟังผ่อนคลาย เปิดไว้ตอนชงชา | Matcha Cafe BGM Playlist	https://i.ytimg.com/vi/ZQSD7roU5Oo/mqdefault.jpg	\N	GMM สบาย สบาย	11	2026-05-29 02:37:43.465613
1005	12	bJq40C-Cz3E	#ฟังเพลงออนไลน์ เปิดคลอไว้ในร้านกาแฟ | Café Music BGM Playlist	https://i.ytimg.com/vi/bJq40C-Cz3E/mqdefault.jpg	\N	GMM สบาย สบาย	12	2026-05-29 02:37:43.470006
1006	12	hOfbEoRa01o	ดนตรีสบายๆ เพลงบรรเลงเพราะๆ ฟังออนไลน์ ฟังยาวต่อเนื่อง #lofijazz	https://i.ytimg.com/vi/hOfbEoRa01o/mqdefault.jpg	\N	GMM สบาย สบาย	13	2026-05-29 02:37:43.474692
1007	12	ak3SUfoBLFE	แจ๊สบรรเลง เพลงหวานในร้านกาแฟ | Café and Jazz Playlist	https://i.ytimg.com/vi/ak3SUfoBLFE/mqdefault.jpg	\N	GMM สบาย สบาย	14	2026-05-29 02:37:43.479159
1008	12	-4qgETlfgWA	ดนตรีบรรเลงเพราะๆ รวมเพลงรัก ฟังสบายๆ | Romantic Love Songs	https://i.ytimg.com/vi/-4qgETlfgWA/mqdefault.jpg	\N	GMM สบาย สบาย	15	2026-05-29 02:37:43.483503
1009	12	7-Uv_YH0YGE	เพลงฟังสบาย 2025 เพลงบรรเลงเพราะๆ ฟังสบายๆ ฟังยาวต่อเนื่อง	https://i.ytimg.com/vi/7-Uv_YH0YGE/mqdefault.jpg	\N	GMM สบาย สบาย	16	2026-05-29 02:37:43.487748
1010	12	8bv3a2Yx3tM	ดนตรีร้านกาแฟ เพลงบรรเลงเพราะๆ ฟังสบายๆ ฟังยาวต่อเนื่อง #LONGPLAY	https://i.ytimg.com/vi/8bv3a2Yx3tM/mqdefault.jpg	\N	GMM สบาย สบาย	17	2026-05-29 02:37:43.492058
1011	12	Hh-jxXGtcTk	เพลงผ่อนคลาย จิบกาแฟฟังเพลินๆ | Coffee Chill Mood BGM	https://i.ytimg.com/vi/Hh-jxXGtcTk/mqdefault.jpg	\N	GMM สบาย สบาย	18	2026-05-29 02:37:43.496254
1012	12	Jwl_fGAL1kY	เพลงรักอารมณ์ดี เปิดฟังตอนนั่งจิบกาแฟ | Coffee Break Love Songs	https://i.ytimg.com/vi/Jwl_fGAL1kY/mqdefault.jpg	\N	GMM สบาย สบาย	19	2026-05-29 02:37:43.500541
1013	12	w_oivuvRuGo	เพลงไทยสไตล์บอสซ่า เปิดคลอไว้ในร้านกาแฟ | Bossa Nova & Coffee Music	https://i.ytimg.com/vi/w_oivuvRuGo/mqdefault.jpg	\N	GMM สบาย สบาย	20	2026-05-29 02:37:43.505033
1014	12	F44uRVRMRuU	ดนตรีบรรเลงเพราะๆ จิบกาแฟชิลๆ ฟังเพลงเพลินๆ | Thai Bossa Cafe Music	https://i.ytimg.com/vi/F44uRVRMRuU/mqdefault.jpg	\N	GMM สบาย สบาย	21	2026-05-29 02:37:43.509807
1015	12	YzlYvUcTo0U	มื้อเช้า.. ฟังพลงชิล | Bossa & Breakfast | Morning Playlist	https://i.ytimg.com/vi/YzlYvUcTo0U/mqdefault.jpg	\N	GMM สบาย สบาย	22	2026-05-29 02:37:43.51448
1016	12	q7qGTML8CoQ	เพลงเพราะร้านกาแฟ ฟังเพลินๆ เปิดได้ทั้งวัน | Lo-Fi Cafe Playlist	https://i.ytimg.com/vi/q7qGTML8CoQ/mqdefault.jpg	\N	GMM สบาย สบาย	23	2026-05-29 02:37:43.518872
1017	12	aFbsylQCzCo	เปียโนฟังเพลินๆ เปิดคลอตอนจิบกาแฟ | Piano Cafe Music	https://i.ytimg.com/vi/aFbsylQCzCo/mqdefault.jpg	\N	GMM สบาย สบาย	24	2026-05-29 02:37:43.523355
1018	12	IwpILPG8wb4	#บอสซาโนว่า พักใจจิบชา ฟังเพลินหน้าหนาว | Bossa & Tea Break Music	https://i.ytimg.com/vi/IwpILPG8wb4/mqdefault.jpg	\N	GMM สบาย สบาย	25	2026-05-29 02:37:43.529607
1019	12	efWnO4bYAHs	รวมเพลงเพราะ ฟังเพลินใจ | Thai Lo-Fi Chill Music	https://i.ytimg.com/vi/efWnO4bYAHs/mqdefault.jpg	\N	GMM สบาย สบาย	26	2026-05-29 02:37:43.53416
1020	12	ATjTkQRrl9Y	#แจ๊สบรรเลง เพลงหวานฟังในร้านกาแฟ | Coffee Jazz Love Songs	https://i.ytimg.com/vi/ATjTkQRrl9Y/mqdefault.jpg	\N	GMM สบาย สบาย	27	2026-05-29 02:37:43.538487
1021	12	Qcf__C6a9fU	เพลงร้านกาแฟ ฟังเพลิน ฟีลดี | Jazzy Coffee Playlist	https://i.ytimg.com/vi/Qcf__C6a9fU/mqdefault.jpg	\N	GMM สบาย สบาย	28	2026-05-29 02:37:43.543295
1022	12	55FuZB58sZc	เพลงเพราะรับลมหนาว อารมณ์ดี  | Feel Good Playlist	https://i.ytimg.com/vi/55FuZB58sZc/mqdefault.jpg	\N	GMM สบาย สบาย	29	2026-05-29 02:37:43.548746
1023	12	FV-TW-1LfXE	เพลงเพราะฟังชิล ฟีลนั่งทำงานในร้านกาแฟ	https://i.ytimg.com/vi/FV-TW-1LfXE/mqdefault.jpg	\N	GMM สบาย สบาย	30	2026-05-29 02:37:43.55301
1024	12	TiVvPi0MP2k	ดนตรีแจ๊ส จิบชายามบ่ายฟังสบายใจ | Smooth Jazz and Chill	https://i.ytimg.com/vi/TiVvPi0MP2k/mqdefault.jpg	\N	GMM สบาย สบาย	31	2026-05-29 02:37:43.557068
1025	12	qXaXVX7NP10	เพลงชิลช่วยฮีลใจ ฟังตอนบ่าย จิบกาแฟ | Afternoon Jazz Playlist	https://i.ytimg.com/vi/qXaXVX7NP10/mqdefault.jpg	\N	GMM สบาย สบาย	32	2026-05-29 02:37:43.561911
1026	12	hGqpaLMY2iQ	#เพลงเพราะๆ เปิดคลอ ในคาเฟ่ | THAI CAFÉ BGM	https://i.ytimg.com/vi/hGqpaLMY2iQ/mqdefault.jpg	\N	GMM สบาย สบาย	33	2026-05-29 02:37:43.56649
1027	12	6nfsVJHV6mI	เปิดเพลงเพราะ ฟังแล้วอารมณ์ดี | Christmas Chill Music	https://i.ytimg.com/vi/6nfsVJHV6mI/mqdefault.jpg	\N	GMM สบาย สบาย	34	2026-05-29 02:37:43.570736
1028	12	Jhr7wxY_I8U	ดนตรีบรรเลงร้านกาแฟ เพลงฟังง่าย สบายหู | Christmas Jazz	https://i.ytimg.com/vi/Jhr7wxY_I8U/mqdefault.jpg	\N	GMM สบาย สบาย	35	2026-05-29 02:37:43.575096
1029	12	5hDgPOyOFrU	#ดนตรีบรรเลง | ฟังเพลงเพลินๆ ในร้านกาแฟ	https://i.ytimg.com/vi/5hDgPOyOFrU/mqdefault.jpg	\N	GMM สบาย สบาย	36	2026-05-29 02:37:43.579418
1030	12	dglyAxno5bc	ดนตรีฟังสบาย ฟังตอนบ่าย จิบกาแฟ | Afternoon Chill Music	https://i.ytimg.com/vi/dglyAxno5bc/mqdefault.jpg	\N	GMM สบาย สบาย	37	2026-05-29 02:37:43.584491
1031	12	Ru4OS-AaaA8	เพลงไทย ฟังสบายในคาเฟ่ | THAI CAFÉ BGM	https://i.ytimg.com/vi/Ru4OS-AaaA8/mqdefault.jpg	\N	GMM สบาย สบาย	38	2026-05-29 02:37:43.588904
1032	12	S3XwxEk42nI	บอสซ่าเพลงไทย ฟังสบายในร้านกาแฟ | Bossa Nova & Coffee Playlist	https://i.ytimg.com/vi/S3XwxEk42nI/mqdefault.jpg	\N	GMM สบาย สบาย	39	2026-05-29 02:37:43.593705
1033	12	gG629WezoEI	#bossacafejazz | เพลงชิลยามบ่าย สายกาแฟ ฟังเพลินๆ	https://i.ytimg.com/vi/gG629WezoEI/mqdefault.jpg	\N	GMM สบาย สบาย	40	2026-05-29 02:37:43.598048
1034	12	l9UCkVhg3Bc	#เพลงร้านกาแฟ | ดนตรีช้าๆ ไว้ฟังชิลๆ	https://i.ytimg.com/vi/l9UCkVhg3Bc/mqdefault.jpg	\N	GMM สบาย สบาย	41	2026-05-29 02:37:43.602731
1035	12	2YpGXKqAHA4	เพลงจิบชาฟังเพลินๆ | Bossa Nova & Tea Playlist	https://i.ytimg.com/vi/2YpGXKqAHA4/mqdefault.jpg	\N	GMM สบาย สบาย	42	2026-05-29 02:37:43.607168
1036	12	x08fNgD1BFo	#acousticguitar | ฟังยามบ่าย สายกาแฟ	https://i.ytimg.com/vi/x08fNgD1BFo/mqdefault.jpg	\N	GMM สบาย สบาย	43	2026-05-29 02:37:43.611377
1037	12	gGZ1q5vUkBk	#bossacafejazz | บอสซาโนว่า เพลงไทยฟังสบายหู	https://i.ytimg.com/vi/gGZ1q5vUkBk/mqdefault.jpg	\N	GMM สบาย สบาย	44	2026-05-29 02:37:43.616151
1038	12	S6lpvgxUCws	#dripcoffee Playlist | เพลงผ่อนคลาย ฟังไปตอนดริปกาแฟ	https://i.ytimg.com/vi/S6lpvgxUCws/mqdefault.jpg	\N	GMM สบาย สบาย	45	2026-05-29 02:37:43.620779
1039	12	LjHOgIzqkAI	#cafejazz | ดนตรีร้านกาแฟ ปล่อยใจฟังไปเพลินๆ	https://i.ytimg.com/vi/LjHOgIzqkAI/mqdefault.jpg	\N	GMM สบาย สบาย	46	2026-05-29 02:37:43.625563
1040	12	YUJBMYp-TW0	Afternoon Coffee Jazz | จิบกาแฟยามบ่าย ฟังเพลงสบายๆ ผ่อนคลายมาก	https://i.ytimg.com/vi/YUJBMYp-TW0/mqdefault.jpg	\N	GMM สบาย สบาย	47	2026-05-29 02:37:43.640762
1041	12	meD1lnWCqXs	รวมเพลงบอสซ่า ฟังเพลินตอนจิบชา | Tea & Bossa Nova Music	https://i.ytimg.com/vi/meD1lnWCqXs/mqdefault.jpg	\N	GMM สบาย สบาย	48	2026-05-29 02:37:43.647897
1042	12	8I82l1uj6HQ	Cafe Jazz Longplay | ดนตรีบรรเลง เปิดคลอไว้ในร้านกาแฟ ฟังยาวต่อเนื่อง	https://i.ytimg.com/vi/8I82l1uj6HQ/mqdefault.jpg	\N	GMM สบาย สบาย	49	2026-05-29 02:37:43.661169
1043	12	7MUH6A1HmXg	เปิดฟังระหว่างทำกาแฟ | COFFEE & JAZZ PLAYLIST	https://i.ytimg.com/vi/7MUH6A1HmXg/mqdefault.jpg	\N	GMM สบาย สบาย	50	2026-05-29 02:37:43.666263
1044	12	cCIoWw66P0M	เพลงชิลฟังยามเช้า | BREAKFAST & JAZZ	https://i.ytimg.com/vi/cCIoWw66P0M/mqdefault.jpg	\N	GMM สบาย สบาย	51	2026-05-29 02:37:43.670874
1045	12	1a12DY7AFP4	เปิดฟังระหว่างอ่าน | Book & Jazz Playlist	https://i.ytimg.com/vi/1a12DY7AFP4/mqdefault.jpg	\N	GMM สบาย สบาย	52	2026-05-29 02:37:43.675706
1046	12	KpGuGK7M0fw	ดนตรีบรรเลง เพลงฟังสบาย สไตล์ร้านกาแฟ	https://i.ytimg.com/vi/KpGuGK7M0fw/mqdefault.jpg	\N	GMM สบาย สบาย	53	2026-05-29 02:37:43.680424
1047	12	haGqEbuT9xY	[CAFE MUSIC] เพลงฟังสบาย ในเวลากาแฟ | Coffee Lounge Music	https://i.ytimg.com/vi/haGqEbuT9xY/mqdefault.jpg	\N	GMM สบาย สบาย	54	2026-05-29 02:37:43.685476
1048	12	hums3Fo2raQ	[LONGPLAY] Coffee and Chill Music | ดนตรีบรรเลง เพลงร้านกาแฟ ฟังสบาย	https://i.ytimg.com/vi/hums3Fo2raQ/mqdefault.jpg	\N	GMM สบาย สบาย	55	2026-05-29 02:37:43.68962
1049	12	mCCezskVzXM	[LONGPLAY] จิบกาแฟ ฟังเพลงเพราะ | Coffee and Cozy Music	https://i.ytimg.com/vi/mCCezskVzXM/mqdefault.jpg	\N	GMM สบาย สบาย	56	2026-05-29 02:37:43.693803
1050	12	ZhWdaww5h-c	[PLAYLIST] เพลงบรรเลงร้านกาแฟ ฟังสบาย | Coffee Shop Music	https://i.ytimg.com/vi/ZhWdaww5h-c/mqdefault.jpg	\N	GMM สบาย สบาย	57	2026-05-29 02:37:43.697942
1051	12	__qQI-MoIqs	Good Morning! 쌀쌀한 날씨와 함께하는 달콤한 가을 아침 재즈 피아노 모음 🍂	https://i.ytimg.com/vi/__qQI-MoIqs/mqdefault.jpg	\N	Music Ch'aewŏn	58	2026-05-29 02:37:43.702981
1052	12	oyeTYUrxD-8	Cafe Playlist | ดนตรีบรรเลง เพลงร้านกาแฟ ฟังเพลินสบายๆ	https://i.ytimg.com/vi/oyeTYUrxD-8/mqdefault.jpg	\N	GMM สบาย สบาย	59	2026-05-29 02:37:43.707784
1053	12	7aTeZFvzruw	[CAFE MUSIC] COFFEE JAZZ MOOD | เพลงบรรเลงร้านกาแฟ ฟังสบาย [ลม,ไม่เคย,คิดถึง]	https://i.ytimg.com/vi/7aTeZFvzruw/mqdefault.jpg	\N	GMM สบาย สบาย	60	2026-05-29 02:37:43.712668
1054	12	Vr2u_DxA_gY	[CAFE MUSIC] Coffee and Chill | เพลงบรรเลงร้านกาแฟ ฟังสบายๆ [เล่าสู่กันฟัง,หมอกหรือควัน]	https://i.ytimg.com/vi/Vr2u_DxA_gY/mqdefault.jpg	\N	GMM สบาย สบาย	61	2026-05-29 02:37:43.716947
1055	12	eG4k0xQlX30	PLAYLIST ดนตรีบรรเลง | เพลงเพราะ ฟังสบาย | เพลงฮีลใจ ฟังไปเพลินๆ	https://i.ytimg.com/vi/eG4k0xQlX30/mqdefault.jpg	\N	GMM สบาย สบาย	62	2026-05-29 02:37:43.721973
1056	12	bbxXdASyLQw	Book & Coffee Jazz - Warm Cozy Music for Reading, Work, Study and Coffee Time	https://i.ytimg.com/vi/bbxXdASyLQw/mqdefault.jpg	\N	Musictag	63	2026-05-29 02:37:43.726643
1057	12	LeGV8y9g4AM	[CAFE PLAYLIST] ตื่นสาย ฟังเพลงชิล | Bossa Nova and Brunch Music	https://i.ytimg.com/vi/LeGV8y9g4AM/mqdefault.jpg	\N	GMM สบาย สบาย	64	2026-05-29 02:37:43.731534
1058	12	zRZsvD01KvA	#cafejazz | ดนตรีฮีลใจ ในร้านกาแฟ	https://i.ytimg.com/vi/zRZsvD01KvA/mqdefault.jpg	\N	GMM สบาย สบาย	65	2026-05-29 02:37:43.736294
1059	12	HSvdYLPDYrI	Smooth Jazz Longplay | เพลงบรรเลงเพราะๆ ปลุกพลัง ฟังแล้วสดชื่น	https://i.ytimg.com/vi/HSvdYLPDYrI/mqdefault.jpg	\N	GMM สบาย สบาย	66	2026-05-29 02:37:43.741588
1060	12	CBxS5P9l9lg	MORNING BOSSA NOVA | ดนตรีบรรเลงฟังสบายยามเช้า	https://i.ytimg.com/vi/CBxS5P9l9lg/mqdefault.jpg	\N	GMM สบาย สบาย	67	2026-05-29 02:37:43.746271
1061	12	MYPVQccHhAQ	4K Cozy Coffee Shop with Smooth Piano Jazz Music for Relaxing, Studying and Working	https://i.ytimg.com/vi/MYPVQccHhAQ/mqdefault.jpg	\N	Relaxing Jazz Piano	68	2026-05-29 02:37:43.750608
1062	12	nRl-ZtSjbjk	ดนตรีฟังเพลินตอนจิบกาแฟ | BOSSA & CAFÉ	https://i.ytimg.com/vi/nRl-ZtSjbjk/mqdefault.jpg	\N	GMM สบาย สบาย	69	2026-05-29 02:37:43.754902
1063	12	2fBMHENNprU	ดนตรีผ่อนคลาย ชิลยามบ่าย ฟังสบายใจ | Afternoon Chill Music	https://i.ytimg.com/vi/2fBMHENNprU/mqdefault.jpg	\N	GMM สบาย สบาย	70	2026-05-29 02:37:43.759618
1064	12	KT9CGpr6o0Y	#lofichill | เพลงชิล ตอนจิบกาแฟ ฟังสบาย หายเหนื่อย	https://i.ytimg.com/vi/KT9CGpr6o0Y/mqdefault.jpg	\N	GMM สบาย สบาย	71	2026-05-29 02:37:43.76438
1065	12	MansaUiJAWo	#caferadio | ดนตรีบรรเลงช้าๆ เปิดในร้านกาแฟชิลๆ | Smooth Jazz & Coffee Break	https://i.ytimg.com/vi/MansaUiJAWo/mqdefault.jpg	\N	GMM สบาย สบาย	72	2026-05-29 02:37:43.769045
1066	12	152-dioGGNo	COFFEE BGM | เพลงชิลฟังสบาย สไตล์ร้านกาแฟ	https://i.ytimg.com/vi/152-dioGGNo/mqdefault.jpg	\N	GMM สบาย สบาย	73	2026-05-29 02:37:43.773679
1067	12	Af8KlUDdIVQ	จิบกาแฟฟังสบาย ใจเย็นอารมณ์ดี	https://i.ytimg.com/vi/Af8KlUDdIVQ/mqdefault.jpg	\N	GMM สบาย สบาย	74	2026-05-29 02:37:43.779072
1068	12	6cVanENM7Fo	จิบกาแฟร้อนๆ ฟังเพลงเย็นๆ ชิลๆ | Acoustic Cafe Chill Music	https://i.ytimg.com/vi/6cVanENM7Fo/mqdefault.jpg	\N	GMM สบาย สบาย	75	2026-05-29 02:37:43.783383
1069	12	37Gg57mDELI	#เพลงบรรเลง แจ๊สไทย ฟังสบาย | THAI JAZZY BGM	https://i.ytimg.com/vi/37Gg57mDELI/mqdefault.jpg	\N	GMM สบาย สบาย	76	2026-05-29 02:37:43.7881
1070	12	ikyTsSouSxc	ดนตรีจิบกาแฟ เพลงสบายใจ ฟังสบายหู | Thai Jazz Coffee Music 2025	https://i.ytimg.com/vi/ikyTsSouSxc/mqdefault.jpg	\N	GMM สบาย สบาย	77	2026-05-29 02:37:43.793387
1071	12	4hFW6PKJ1bg	เพลงเพราะฟีลดี ฟังในร้านกาแฟเพลินๆ | Lo-Fi Jazz Cafe Playlist	https://i.ytimg.com/vi/4hFW6PKJ1bg/mqdefault.jpg	\N	GMM สบาย สบาย	78	2026-05-29 02:37:43.797671
1072	12	y8yNbVX7I24	เพลงชิลยามบ่าย จิบไป ฟังไป | Jazzy Chill Music 2025	https://i.ytimg.com/vi/y8yNbVX7I24/mqdefault.jpg	\N	GMM สบาย สบาย	79	2026-05-29 02:37:43.801979
1073	12	BLlhzyNr9V0	อะคูสติก เพลงฟังเพลิน เปิดไว้ในคาเฟ่	https://i.ytimg.com/vi/BLlhzyNr9V0/mqdefault.jpg	\N	GMM สบาย สบาย	80	2026-05-29 02:37:43.806366
1074	12	7IZ4XxQrRP0	ดนตรีบรรเลงร้านกาแฟ เพลงเพราะช้าๆ ฟังชิลๆ | Coffee Shop Chill Music	https://i.ytimg.com/vi/7IZ4XxQrRP0/mqdefault.jpg	\N	GMM สบาย สบาย	81	2026-05-29 02:37:43.81089
1075	12	gBTU0XHfW1Y	เพลงบรรเลงยามบ่าย ฟังผ่อนคลายเพลินๆ | Afternoon Chill Music	https://i.ytimg.com/vi/gBTU0XHfW1Y/mqdefault.jpg	\N	GMM สบาย สบาย	82	2026-05-29 02:37:43.815643
1076	12	SKpimQIwGj0	ฟังเพลงเพลินใจ เปิดคลอไว้ตอนจิบกาแฟ | Coffee Shop BGM Playlist	https://i.ytimg.com/vi/SKpimQIwGj0/mqdefault.jpg	\N	GMM สบาย สบาย	83	2026-05-29 02:37:43.819947
1077	12	YKPuRtUN1Og	เพลงบรรเลงเพราะๆ โดนใจสายคาเฟ่ | Cafe BGM Playlist	https://i.ytimg.com/vi/YKPuRtUN1Og/mqdefault.jpg	\N	GMM สบาย สบาย	84	2026-05-29 02:37:43.824939
1078	12	tRzE-Pve0ZI	เพลงจิบกาแฟ ฟังเพลินยามบ่าย | Afternoon Chill Vibes BGM	https://i.ytimg.com/vi/tRzE-Pve0ZI/mqdefault.jpg	\N	GMM สบาย สบาย	85	2026-05-29 02:37:43.830867
1079	12	bYBoxl0saC0	ชงกาแฟ ฟังเพลงชิลๆ | Coffee Time BGM Playlist	https://i.ytimg.com/vi/bYBoxl0saC0/mqdefault.jpg	\N	GMM สบาย สบาย	86	2026-05-29 02:37:43.835804
1080	12	a6OMsaMCdw4	อยู่บ้านฟังเพลงชิล ได้ฟีลอยู่ร้านกาแฟ | Home Cafe Playlist	https://i.ytimg.com/vi/a6OMsaMCdw4/mqdefault.jpg	\N	GMM สบาย สบาย	87	2026-05-29 02:37:43.841734
1081	12	5SNH47xZLjs	#ฟังเพลงไทย สไตล์ร้านกาแฟ | Coffee Shop BGM Playlist	https://i.ytimg.com/vi/5SNH47xZLjs/mqdefault.jpg	\N	GMM สบาย สบาย	88	2026-05-29 02:37:43.847289
1082	12	rJBKaMKplDk	ดนตรีบรรเลง ฟังเพลงตอนทำกาแฟ | Coffee House BGM Playlist	https://i.ytimg.com/vi/rJBKaMKplDk/mqdefault.jpg	\N	GMM สบาย สบาย	89	2026-05-29 02:37:43.853122
1083	12	5APSBhI3DeU	จิบกาแฟฟังเพลงเพราะ ฟีลดีๆ ฟังเพลินๆ | Coffee & Piano	https://i.ytimg.com/vi/5APSBhI3DeU/mqdefault.jpg	\N	GMM สบาย สบาย	90	2026-05-29 02:37:43.857632
1084	12	SiEpVLU2Dzc	ดนตรีแจ๊สฟังสบาย ไว้เปิดคลอในคาเฟ่ | Coffe & Jazz BGM	https://i.ytimg.com/vi/SiEpVLU2Dzc/mqdefault.jpg	\N	GMM สบาย สบาย	91	2026-05-29 02:37:43.862304
1085	12	MfK34i20rvw	ดนตรีฟังชิลๆ ได้ฟีลตอนจิบกาแฟ | Coffee & Thai Jazz BGM Playlist	https://i.ytimg.com/vi/MfK34i20rvw/mqdefault.jpg	\N	GMM สบาย สบาย	92	2026-05-29 02:37:43.866876
1086	12	mBwdclNgwjI	#เพลงร้านกาแฟ ฟังสบาย สไตล์บอสซ่า | Bossa Nova Café Mix BGM	https://i.ytimg.com/vi/mBwdclNgwjI/mqdefault.jpg	\N	GMM สบาย สบาย	93	2026-05-29 02:37:43.871087
1087	12	f1BtL29Yogo	#ดนตรีร้านกาแฟ ฟังตอนฝนพรำ ฮัมตามได้ | Café Music with Rainy Mood	https://i.ytimg.com/vi/f1BtL29Yogo/mqdefault.jpg	\N	GMM สบาย สบาย	94	2026-05-29 02:37:43.875774
1088	12	Uco_xxCZAj8	รวมเพลงชิลๆ เปิดฟังยามบ่าย | ฟังเสียงฝนสบายๆ ในวันพักผ่อน	https://i.ytimg.com/vi/Uco_xxCZAj8/mqdefault.jpg	\N	GMM สบาย สบาย	95	2026-05-29 02:37:43.880268
1089	12	zPkWzdGKhdM	รวมเพลงไทย เปิดคลอไว้ในร้านอาหาร | Thai Restaurants BGM Playlist	https://i.ytimg.com/vi/zPkWzdGKhdM/mqdefault.jpg	\N	GMM สบาย สบาย	96	2026-05-29 02:37:43.884892
1090	12	AgicfTq7kDU	ดนตรีบรรเลงเพราะๆ เพลงฟังเพลินละมุนหู | Thai Pop Cafe BGM	https://i.ytimg.com/vi/AgicfTq7kDU/mqdefault.jpg	\N	GMM สบาย สบาย	97	2026-05-29 02:37:43.889334
1091	12	Q6ylr-jwdio	เพลงเพราะ เหมาะฟังในร้านกาแฟ | Cafe Thai BGM	https://i.ytimg.com/vi/Q6ylr-jwdio/mqdefault.jpg	\N	GMM สบาย สบาย	98	2026-05-29 02:37:43.893936
1092	12	l8T_PP7io_c	ดนตรีบรรเลงผ่อนคลาย เพลงฟังสบายในมื้อเช้า | Breakfast & Bossa BGM	https://i.ytimg.com/vi/l8T_PP7io_c/mqdefault.jpg	\N	GMM สบาย สบาย	99	2026-05-29 02:37:43.898431
1093	12	exclo_0Rk4U	ดนตรีแจ๊สบรรเลงเพราะๆ ฟังเพลงรักในร้านกาแฟ | Cozy & Jazzy Thai Love Songs	https://i.ytimg.com/vi/exclo_0Rk4U/mqdefault.jpg	\N	GMM สบาย สบาย	100	2026-05-29 02:37:43.903234
1094	12	Httt3JU9nCg	เพลงไทยสไตล์สากล ฟังเพลินในร้านกาแฟ | Thai Café Playlist	https://i.ytimg.com/vi/Httt3JU9nCg/mqdefault.jpg	\N	GMM สบาย สบาย	101	2026-05-29 02:37:43.907577
1095	12	AfQwMoLGWdg	ดนตรีบรรเลงเพราะๆ เพลงรักหวานละมุนฟังคุ้นหู	https://i.ytimg.com/vi/AfQwMoLGWdg/mqdefault.jpg	\N	GMM สบาย สบาย	102	2026-05-29 02:37:43.91282
1096	12	N3PnwEkV0DY	รวมเพลงร้านกาแฟ 2025 ดนตรีฟังชิลฟีลอยู่คาเฟ่ | Cafe Jazz & Cozy Coffee BGM	https://i.ytimg.com/vi/N3PnwEkV0DY/mqdefault.jpg	\N	GMM สบาย สบาย	103	2026-05-29 02:37:43.916958
1097	12	OnYUM7tjI2Q	รวมเพลงไทยสบายๆ เปิดฟังเพลินๆตอนชงชาชิลๆ | Thai Tea Break Playlist	https://i.ytimg.com/vi/OnYUM7tjI2Q/mqdefault.jpg	\N	GMM สบาย สบาย	104	2026-05-29 02:37:43.921956
1098	12	MbR5hO-y4Ws	รวมเพลงผ่อนคลายชิลๆ เพลงเพราะเหมาะเปิดในคาเฟ | Café Jazzy BGM Playlist	https://i.ytimg.com/vi/MbR5hO-y4Ws/mqdefault.jpg	\N	GMM สบาย สบาย	105	2026-05-29 02:37:43.926366
1099	12	KNPSUszw2hY	บอสซาโนว่า พักใจจิบชา ฟังเพลินสบายๆ | Bossa Nova & Tea Playlist	https://i.ytimg.com/vi/KNPSUszw2hY/mqdefault.jpg	\N	GMM สบาย สบาย	106	2026-05-29 02:37:43.931029
1100	12	yUNhrL9vz0g	ดนตรีอารมณ์ดี ฟังเพลินในร้านกาแฟ	https://i.ytimg.com/vi/yUNhrL9vz0g/mqdefault.jpg	\N	GMM สบาย สบาย	107	2026-05-29 02:37:43.935531
1101	12	CSFwJwfbSMg	[LONGPLAY] เพลงร้านกาแฟ ดนตรีฟังเพลิน 3 ชั่วโมง #ฟังเพลงยาวๆ #ไม่มีโฆษณา	https://i.ytimg.com/vi/CSFwJwfbSMg/mqdefault.jpg	\N	GMM สบาย สบาย	108	2026-05-29 02:37:43.939794
1102	12	9o-vHYajFIg	ดนตรีชิวสบายๆ ฟังตอนบ่าย จิบกาแฟ	https://i.ytimg.com/vi/9o-vHYajFIg/mqdefault.jpg	\N	GMM สบาย สบาย	109	2026-05-29 02:37:43.94388
1103	12	aU5ipEesxoI	ดนตรีผ่อนคลายเพราะๆ เปิดเบาๆ ฟังเพลินมาก | Tea Break Music	https://i.ytimg.com/vi/aU5ipEesxoI/mqdefault.jpg	\N	GMM สบาย สบาย	110	2026-05-29 02:37:43.947991
1104	12	X9DOElulbYc	ฟังเพลงออนไลน์เพราะๆ เปิดคลอไว้ในร้านกาแฟ | Café Music BGM Playlist	https://i.ytimg.com/vi/X9DOElulbYc/mqdefault.jpg	\N	GMM สบาย สบาย	111	2026-05-29 02:37:43.952216
1105	12	L5PaFfbNlmk	รวมเพลงบรรเลงแจ๊สไทย จิบกาแฟฟังชิลๆ | เพลงร้านกาแฟ ฟังยาวต่อเนื่อง	https://i.ytimg.com/vi/L5PaFfbNlmk/mqdefault.jpg	\N	GMM สบาย สบาย	112	2026-05-29 02:37:43.957054
1106	12	OVG928am3VA	รวมเพลงเพราะๆ จิบกาแฟ ฟังสบายในวันหยุด | Holiday Cafe Music Vol.1	https://i.ytimg.com/vi/OVG928am3VA/mqdefault.jpg	\N	GMM สบาย สบาย	113	2026-05-29 02:37:43.961418
1107	12	qhk0cue9SFc	รวมเพลงเพราะๆ จิบกาแฟ ฟังสบายในวันหยุด | Holiday Cafe Music Vol.2	https://i.ytimg.com/vi/qhk0cue9SFc/mqdefault.jpg	\N	GMM สบาย สบาย	114	2026-05-29 02:37:43.965938
1108	12	DPNtmd72lQk	ดนตรีบรรเลง รวมเพลงร้านกาแฟ ฟังยาวๆ ต่อเนื่อง  | Café BGM Playlist	https://i.ytimg.com/vi/DPNtmd72lQk/mqdefault.jpg	\N	GMM สบาย สบาย	115	2026-05-29 02:37:43.970266
1109	12	9Ti3rFSkSus	รวมเพลงเพราะๆ จิบกาแฟ ฟังสบายในวันหยุด | Holiday Cafe Music Vol.3	https://i.ytimg.com/vi/9Ti3rFSkSus/mqdefault.jpg	\N	GMM สบาย สบาย	116	2026-05-29 02:37:43.974457
1110	12	fqW1zL5r3es	#ดนตรีบรรเลง เพลงร้านกาแฟฟังสบายๆ เพลงเพราะออนไลน์ ต่อเนื่อง | Café BGM Playlist	https://i.ytimg.com/vi/fqW1zL5r3es/mqdefault.jpg	\N	GMM สบาย สบาย	117	2026-05-29 02:37:43.979095
1111	12	ZqnZ_i7Xh8g	รวมเพลงเพราะๆ จิบกาแฟ ฟังสบายในวันหยุด | Holiday Cafe Music Vol.5	https://i.ytimg.com/vi/ZqnZ_i7Xh8g/mqdefault.jpg	\N	GMM สบาย สบาย	118	2026-05-29 02:37:43.984167
1112	12	FL-0k_4UQ2A	ดนตรีบรรเลง ฟังเพลงรัก ฤดูหนาว #ฟังเพลงออนไลน์  | Winter Love Songs Longplay	https://i.ytimg.com/vi/FL-0k_4UQ2A/mqdefault.jpg	\N	GMM สบาย สบาย	119	2026-05-29 02:37:43.988632
1113	12	YuGTtX_-wsQ	ดนตรีบรรเลง ทำนองคุ้น ฟังแล้วอุ่นใจ | Winter Mood Background Music	https://i.ytimg.com/vi/YuGTtX_-wsQ/mqdefault.jpg	\N	GMM สบาย สบาย	120	2026-05-29 02:37:43.993288
1114	12	lPnxZ7LamxQ	ดนตรีเพราะๆ เพลงฮีลใจ เปิดคลอไว้ในร้านกาแฟ | Café Music BGM Playlist	https://i.ytimg.com/vi/lPnxZ7LamxQ/mqdefault.jpg	\N	GMM สบาย สบาย	121	2026-05-29 02:37:43.99771
1115	12	v2W-Fjqp1zU	#bossacafejazz | บอสซาโนว่า เพลงหวานฟังในร้านกาแฟ	https://i.ytimg.com/vi/v2W-Fjqp1zU/mqdefault.jpg	\N	GMM สบาย สบาย	122	2026-05-29 02:37:44.003235
1116	12	hLFJqFTwal4	รวมเพลงฟีลดี ฟังตอนเช้าๆ | รวมเพลงฟังยาวต่อเนื่อง | Good Energy Music Playlist	https://i.ytimg.com/vi/hLFJqFTwal4/mqdefault.jpg	\N	GMM สบาย สบาย	123	2026-05-29 02:37:44.015096
1117	12	WuRLkuMUGJw	รวมเพลงฟีลดี ฟังตอนเช้าๆ | ฟังยาวๆต่อเนื่อง | Good Energy Morning Playlist	https://i.ytimg.com/vi/WuRLkuMUGJw/mqdefault.jpg	\N	GMM สบาย สบาย	124	2026-05-29 02:37:44.020054
1118	12	LXw4gh7Q95U	ดนตรีบรรเลง แจ๊สไทยเพราะๆ เปิดคลอในคาเฟ่ [Cafe Thai Jazz Playlist]	https://i.ytimg.com/vi/LXw4gh7Q95U/mqdefault.jpg	\N	GMM สบาย สบาย	125	2026-05-29 02:37:44.024591
1119	12	U6dHQh-mWgY	เพลงบรรเลงเพราะๆ เพลงเพราะน่าฟัง เหมือนนั่งในคาเฟ่ #เพลงร้านกาแฟ2026	https://i.ytimg.com/vi/U6dHQh-mWgY/mqdefault.jpg	\N	GMM สบาย สบาย	126	2026-05-29 02:37:44.028996
1120	12	Rt81nJjgyZA	เพลงบรรเลงไทยสไตล์แจ๊ส จิบกาแฟ ฟังเพลินๆ - Cafe Bgm Playlist	https://i.ytimg.com/vi/Rt81nJjgyZA/mqdefault.jpg	\N	GMM สบาย สบาย	127	2026-05-29 02:37:44.037815
1121	12	GrREDE17Q9s	#เพลงร้านกาแฟ2026 | เพลงแจ๊สไทย สไตล์ร้านกาแฟ ฟังยาวต่อเนื่อง | Thai Cafe Jazz Playlist	https://i.ytimg.com/vi/GrREDE17Q9s/mqdefault.jpg	\N	GMM สบาย สบาย	128	2026-05-29 02:37:44.043346
1122	12	Ca-5JDpS1co	#เพลงบรรเลงร้านกาแฟ | เพลงแจ๊สไทย สไตล์คาเฟ่ ฟังยาวต่อเนื่อง | Thai Cafe Jazz Playlist	https://i.ytimg.com/vi/Ca-5JDpS1co/mqdefault.jpg	\N	GMM สบาย สบาย	129	2026-05-29 02:37:44.047915
1123	12	woswzTyaZ-I	#ดนตรีบรรเลงร้านกาแฟ รวมเพลงฟังสบาย สไตล์คาเฟ่ | Thai Cafe Jazz Playlist	https://i.ytimg.com/vi/woswzTyaZ-I/mqdefault.jpg	\N	GMM สบาย สบาย	130	2026-05-29 02:37:44.052792
1124	12	x7EUB8qXqGw	ฟังเพลงออนไลน์ ดนตรีฟังสบายๆ สไตล์ร้านกาแฟ ฟังยาวต่อเนื่อง | Thai Cafe Jazz Playlist	https://i.ytimg.com/vi/x7EUB8qXqGw/mqdefault.jpg	\N	GMM สบาย สบาย	131	2026-05-29 02:37:44.05706
1125	12	xQK_6N5yv8E	#ฟังเพลงออนไลน์ ดนตรีฟังสบายๆ สไตล์คาเฟ่ | ฟังยาวต่อเนื่อง | Thai Cafe Jazz Playlist	https://i.ytimg.com/vi/xQK_6N5yv8E/mqdefault.jpg	\N	GMM สบาย สบาย	132	2026-05-29 02:37:44.062167
1126	12	_W9Jy4hpyTw	#ดนตรีบรรเลงเพราะๆ เพลงทำงาน จิบกาแฟเพลินๆ 1 ชั่วโมงเต็ม	https://i.ytimg.com/vi/_W9Jy4hpyTw/mqdefault.jpg	\N	GMM สบาย สบาย	133	2026-05-29 02:37:44.067049
1127	12	fHvsr4ODKtg	ดนตรีบรรเลง เพลงแจ๊สไทย สไตล์ร้านกาแฟ Vol.1 | Coffee Shop BGM	https://i.ytimg.com/vi/fHvsr4ODKtg/mqdefault.jpg	\N	GMM สบาย สบาย	134	2026-05-29 02:37:44.071903
1128	12	L3X3KT0aL3Q	ดนตรีบรรเลง เพลงแจ๊สไทย สไตล์ร้านกาแฟ Vol.2 | COFFEE SHOP BGM PLAYLIST #lofi #longplay	https://i.ytimg.com/vi/L3X3KT0aL3Q/mqdefault.jpg	\N	GMM สบาย สบาย	135	2026-05-29 02:37:44.076511
1129	12	lav05FH1h_g	ดนตรีบรรเลง เพลงหวานๆ ในร้านกาแฟ #เพลงร้านกาแฟ2026 #เพลงบรรเลงเพราะๆ	https://i.ytimg.com/vi/lav05FH1h_g/mqdefault.jpg	\N	GMM สบาย สบาย	136	2026-05-29 02:37:44.081328
1130	12	xd911jJSFtI	ดนตรีบรรเลง เพลงผ่อนคลาย ฟังสบายๆ #ฟังตอนทำงาน #เพลงจิบกาแฟ #ฟังเพลงออนไลน์ | Café BGM Playlist	https://i.ytimg.com/vi/xd911jJSFtI/mqdefault.jpg	\N	GMM สบาย สบาย	137	2026-05-29 02:37:44.08605
1131	12	KZi4DpAyqFQ	#ดนตรีบรรเลงเพราะๆ เพลงแจ๊สไทย สไตล์ร้านกาแฟ Vol.3 [ ดนตรีเปิดคลอๆ ในร้านกาแฟ ]	https://i.ytimg.com/vi/KZi4DpAyqFQ/mqdefault.jpg	\N	GMM สบาย สบาย	138	2026-05-29 02:37:44.090632
1132	12	VS3YAv9BiHc	[1 hr] Playlist ดนตรีบรรเลง เพลงแจ๊สไทย สไตล์ร้านกาแฟ Vol.4 | COFFEE SHOP BGM #lofi #longplay	https://i.ytimg.com/vi/VS3YAv9BiHc/mqdefault.jpg	\N	GMM สบาย สบาย	139	2026-05-29 02:37:44.095508
1133	12	cwJR8_bcCRA	[1 hr] Playlist ดนตรีบรรเลงเพราะๆ จิบกาแฟฟังเพลินๆ | Thai Bossa Nova Cafe Music	https://i.ytimg.com/vi/cwJR8_bcCRA/mqdefault.jpg	\N	GMM สบาย สบาย	140	2026-05-29 02:37:44.099794
1134	12	B-8hEQKjqIs	#เพลงบรรเลงเพราะๆ รวมเพลงรัก ฟังคลายร้อน | Summer Chill Music #รวมเพลงสงกรานต์	https://i.ytimg.com/vi/B-8hEQKjqIs/mqdefault.jpg	\N	GMM สบาย สบาย	141	2026-05-29 02:37:44.104355
1135	12	iBSwA45EIao	#เพลงบรรเลง รวมเพลงรัก ฟังคลายร้อน | Summer Chill Music #เพลงรักฟังสบาย #เพลงยุค90	https://i.ytimg.com/vi/iBSwA45EIao/mqdefault.jpg	\N	GMM สบาย สบาย	142	2026-05-29 02:37:44.108537
1136	12	bc4DGmeFknU	[1 hr] Playlist ดนตรีเปิดคลอๆ ตอนจิบกาแฟ | THAI JAZZ COFFEE TIME [ LONGPLAY ]	https://i.ytimg.com/vi/bc4DGmeFknU/mqdefault.jpg	\N	GMM สบาย สบาย	143	2026-05-29 02:37:44.112756
1137	12	zs_AMwWW8cE	เพลงจิบกาแฟ ฟังสบายในหน้าฝน | Lo-Fi Thai & Coffee Playlist [ดอกกระเจียวบาน,โลกทั้งใบ,ฝากให้เขารัก]	https://i.ytimg.com/vi/zs_AMwWW8cE/mqdefault.jpg	\N	GMM สบาย สบาย	144	2026-05-29 02:37:44.116928
1138	12	W1qzQRILVkQ	[1 hr] Playlist เพลงบรรเลงเพราะๆ ดนตรีเปิดคลอๆ ตอนจิบกาแฟ | THAI BOSSA NOVA CAFÉ	https://i.ytimg.com/vi/W1qzQRILVkQ/mqdefault.jpg	\N	GMM สบาย สบาย	145	2026-05-29 02:37:44.123585
1139	12	fvHzICzrv0g	Private video		\N		146	2026-05-29 02:37:44.128119
1140	12	j-1vHVGUafQ	Private video		\N		147	2026-05-29 02:37:44.132608
1141	12	Bm5yvp1N5z0	Private video		\N		148	2026-05-29 02:37:44.13843
1142	12	bo4psdICyKU	Private video		\N		149	2026-05-29 02:37:44.142675
1143	13	3rHzPHrvl64	[ เพลงเพราะๆฟังสบายๆ ]  ผ่อนคลายตอนขี้เกียจทำงาน 【LONGPLAY】	https://i.ytimg.com/vi/3rHzPHrvl64/mqdefault.jpg	\N	60 Minutes Longplay	1	2026-05-29 02:37:47.718149
1144	13	bX-bfllOEU8	เพลงชิล ฟังเพลงฮีลใจ อารมณ์ดีๆ 【LONGPLAY】 [เพลงเพราะๆฟังสบายๆ]	https://i.ytimg.com/vi/bX-bfllOEU8/mqdefault.jpg	\N	60 Minutes Longplay	2	2026-05-29 02:37:47.723236
1145	13	X0isawt-reM	ฟังเพลงทำงาน สักพักไม่ทำงาน ฟังแต่เพลง   [เพลงเก่า,เพลงเพราะหน้าฝน ]【LONGPLAY】	https://i.ytimg.com/vi/X0isawt-reM/mqdefault.jpg	\N	60 Minutes Longplay	3	2026-05-29 02:37:47.727354
1146	13	AMA6POsVwsA	Chill Longplay ขับรถ ฟังเพลง แล้วคิดถึงเธอ [คิดถึงนะ,อยู่ๆก็มาปรากฏตัวในหัวใจ]【LONGPLAY】	https://i.ytimg.com/vi/AMA6POsVwsA/mqdefault.jpg	\N	60 Minutes Longplay	4	2026-05-29 02:37:47.733074
1147	13	9UQKtd94ZwI	ขับรถชิลๆ ฟังสบายๆ #เพลงเพราะ  #เพลงชิลหน้าฝน【LONGPLAY】	https://i.ytimg.com/vi/9UQKtd94ZwI/mqdefault.jpg	\N	60 Minutes Longplay	5	2026-05-29 02:37:47.737569
1148	13	rf2FRKecqLk	Chill Longplay จิบกาแฟ…. อยู่บ้านแบบเหงาๆ [cafe,chill,relax ]【LONGPLAY】	https://i.ytimg.com/vi/rf2FRKecqLk/mqdefault.jpg	\N	60 Minutes Longplay	6	2026-05-29 02:37:47.742651
1149	13	Kux8JIjxld4	[เพลงเพราะๆฟังสบายๆ]  เพลงชิลๆ ประจำร้านกาแฟ [cover,Acoustic ,cafe ,coffee ] 【LONGPLAY】	https://i.ytimg.com/vi/Kux8JIjxld4/mqdefault.jpg	\N	60 Minutes Longplay	7	2026-05-29 02:37:47.746834
1150	13	ZaJ05zYR4OQ	CHILL COVER เพลงเก่าชิลๆเพราะๆ #chill #cafe #relax 【LONGPLAY】	https://i.ytimg.com/vi/ZaJ05zYR4OQ/mqdefault.jpg	\N	60 Minutes Longplay	8	2026-05-29 02:37:47.751467
1151	13	xuDUtc7vuh4	เพลงเก่า 90-2000 : ชิลๆเพราะๆ ฟังแล้วสบายใจ 【LONGPLAY】   [เพลงร้านกาแฟ,เพลงเพราะๆฟังสบายๆ ]	https://i.ytimg.com/vi/xuDUtc7vuh4/mqdefault.jpg	\N	60 Minutes Longplay	9	2026-05-29 02:37:47.755635
1152	13	MPvPJE0ZJbg	รวมเพลงเพราะ - ฟังสบาย หายเหนื่อย  [ Cover hits , café chill ,spa & relax ] 【LONGPLAY】	https://i.ytimg.com/vi/MPvPJE0ZJbg/mqdefault.jpg	\N	60 Minutes Longplay	10	2026-05-29 02:37:47.760208
1153	13	bpW-EMCK8KU	รวมเพลงฮิตเก่า ฟังเพลินตอนทำงาน [เพลงเพราะๆ ฟังสบายๆ,เพลงยุค90เพราะๆ,เพลงร้านกาแฟ ]【LONGPLAY】	https://i.ytimg.com/vi/bpW-EMCK8KU/mqdefault.jpg	\N	60 Minutes Longplay	11	2026-05-29 02:37:47.764527
1154	13	jG79A1bKhGY	เพลงชิลๆเพราะๆ : กาแฟ วิวดีๆ และเพลงชิล [เพลงทำงาน ,เพลงร้านกาแฟ ]【LONGPLAY】	https://i.ytimg.com/vi/jG79A1bKhGY/mqdefault.jpg	\N	60 Minutes Longplay	12	2026-05-29 02:37:47.768798
1155	13	DldmBRFHwsU	LONELY RELAXING   เหงาๆก็ชิลได้ [เพลงร้านกาแฟ,เพลงเพราะๆฟังสบายๆ ]【LONGPLAY】	https://i.ytimg.com/vi/DldmBRFHwsU/mqdefault.jpg	\N	60 Minutes Longplay	13	2026-05-29 02:37:47.773088
1156	13	7NtdHc0nlyk	Acoustic CAFÉ หนีงานไปจิบกาแฟ  [เพลงชิล,ฟังทำงาน]【LONGPLAY】	https://i.ytimg.com/vi/7NtdHc0nlyk/mqdefault.jpg	\N	60 Minutes Longplay	14	2026-05-29 02:37:47.777478
1157	13	6M67EKM7zMQ	Morning Mood Camping เพลินๆ [ท่องเที่ยว,จิบกาแฟ,พักผ่อน ,Relax ]【LONGPLAY】	https://i.ytimg.com/vi/6M67EKM7zMQ/mqdefault.jpg	\N	60 Minutes Longplay	15	2026-05-29 02:37:47.781531
1158	13	evkwrWCPqto	Morning Mood ฟังสบายริมทะเล 【LONGPLAY】	https://i.ytimg.com/vi/evkwrWCPqto/mqdefault.jpg	\N	60 Minutes Longplay	16	2026-05-29 02:37:47.786244
1159	13	YbMcL3xh_YE	Chill Longplay กินกาแฟ ที่โต๊ะทำงาน แล้วคิดถึงเธอ 【LONGPLAY】	https://i.ytimg.com/vi/YbMcL3xh_YE/mqdefault.jpg	\N	60 Minutes Longplay	17	2026-05-29 02:37:47.790694
1160	13	Hi-Op5e3SK0	Morning Mood เพลงเก่าชิลฟังสบาย [cafe,coffee,เพลงชิล เพลงยามเช้า] 【LONGPLAY】	https://i.ytimg.com/vi/Hi-Op5e3SK0/mqdefault.jpg	\N	60 Minutes Longplay	18	2026-05-29 02:37:47.795673
1161	13	PFKg1JFz0iA	"เพลงชิล"บรรยากาศแบบนี้…ต้องฟังเพลงเพราะๆ ฟังสบายๆ 【LONGPLAY】	https://i.ytimg.com/vi/PFKg1JFz0iA/mqdefault.jpg	\N	60 Minutes Longplay	19	2026-05-29 02:37:47.8
1162	13	0bNCgR7GOv4	ทำงานไป  กินกาแฟไป ฟังเพลงเพลินๆ【LONGPLAY】[เพลงเพราะๆฟังสบายๆ  ]	https://i.ytimg.com/vi/0bNCgR7GOv4/mqdefault.jpg	\N	60 Minutes Longplay	20	2026-05-29 02:37:47.804934
1163	13	kC1s7Q0Ii-Y	เพลงเพราะ บรรยากาศแบบนี้ ไปเที่ยวกันเถอะ [ CHILL & RELAX ] 【LONGPLAY】	https://i.ytimg.com/vi/kC1s7Q0Ii-Y/mqdefault.jpg	\N	60 Minutes Longplay	21	2026-05-29 02:37:47.809398
1164	13	qlm-ms-IWJo	ฟังเพลง ทำงานไป บอกรักไป 【LONGPLAY】[เพลงเพราะ เพลงชิล ]	https://i.ytimg.com/vi/qlm-ms-IWJo/mqdefault.jpg	\N	60 Minutes Longplay	22	2026-05-29 02:37:47.814106
1165	13	ThCKGP5ygvU	เพลงชิล : บรรยากาศแบบนี้….กับแมวตัวโปรด [ #เพลงร้านกาแฟ #เพลงเพราะๆฟังสบายๆ   ]【LONGPLAY】	https://i.ytimg.com/vi/ThCKGP5ygvU/mqdefault.jpg	\N	60 Minutes Longplay	23	2026-05-29 02:37:47.818455
1166	13	wjRrTvN6bXM	เพลง ทำงานไป ฟังเพลงไป โคตรดีเลย [ #ฟังทำงาน #ร้านกาแฟ ]【LONGPLAY】	https://i.ytimg.com/vi/wjRrTvN6bXM/mqdefault.jpg	\N	60 Minutes Longplay	24	2026-05-29 02:37:47.823528
1167	13	AIGWNQsreQc	ผิด รอตัดเพล เพลงชิล : บรรยากาศแบบนี้….สบายใจจัง [ #เพลงร้านกาแฟ #เพลงเพราะๆฟังสบายๆ   ]【LONGPLAY】	https://i.ytimg.com/vi/AIGWNQsreQc/mqdefault.jpg	\N	60 Minutes Longplay	25	2026-05-29 02:37:47.82806
1168	13	nhzpLu0n3Es	รวมเพลง cover ฟังชิลๆในร้านกาแฟ  / จิบเบาๆร้านเหล้า [โรส ,KLEAR,25 Hours]【LONGPLAY】	https://i.ytimg.com/vi/nhzpLu0n3Es/mqdefault.jpg	\N	60 Minutes Longplay	26	2026-05-29 02:37:47.832886
1169	13	LOaT3NZv_r0	กินกาแฟ กับเพลงเก่าเพราะๆ [โรส ศิรินทิพย์, ใหม่ เจริญปุระ,PEACEMAKER]【LONGPLAY】	https://i.ytimg.com/vi/LOaT3NZv_r0/mqdefault.jpg	\N	60 Minutes Longplay	27	2026-05-29 02:37:47.837352
1170	13	zShK9DKEhx8	รวมเพลงชิล 1 วันหลายฤดู [PARADOX,แหลม สมพล, 25 Hours ]【LONGPLAY】	https://i.ytimg.com/vi/zShK9DKEhx8/mqdefault.jpg	\N	60 Minutes Longplay	28	2026-05-29 02:37:47.843683
1171	13	aVbsgYBpAxs	SUNDAY SPECIAL -  รวมเพลงเพราะ ฟังชิลๆในร้านกาแฟ【LONGPLAY】	https://i.ytimg.com/vi/aVbsgYBpAxs/mqdefault.jpg	\N	60 Minutes Longplay	29	2026-05-29 02:37:47.848984
1172	13	XKl9D2r13aE	ถ้าเราฟังเพลงเศร้า เราอาจจะไม่ง่วง 【LONGPLAY】[ฟังแก้ง่วงตอนทำงาน/ขับรถ ] อ่ะลองดู	https://i.ytimg.com/vi/XKl9D2r13aE/mqdefault.jpg	\N	60 Minutes Longplay	30	2026-05-29 02:37:47.854189
1173	13	MT2DZnpOXAs	อากาศดีๆ นั่งจิบไปกับเพลงชิลๆ【LONGPLAY】เพลงเก่า ร้องตามได้ ฮิตมาก	https://i.ytimg.com/vi/MT2DZnpOXAs/mqdefault.jpg	\N	60 Minutes Longplay	31	2026-05-29 02:37:47.858525
1282	13	sr4sQumcO3s	ฟังเพลินเพลงเก่า  ยุค 80-90 Ver.2【LONGPLAY】	https://i.ytimg.com/vi/sr4sQumcO3s/mqdefault.jpg	\N	60 Minutes Longplay	140	2026-05-29 02:37:48.364567
1174	13	9HTjlrFuWUc	เพลงเพราะฟังเพลินๆ  ระหว่างทำงาน เดินทาง [ทำอะไรสักอย่าง,แพ้ทาง,รักเหอะ]【LONGPLAY】	https://i.ytimg.com/vi/9HTjlrFuWUc/mqdefault.jpg	\N	60 Minutes Longplay	32	2026-05-29 02:37:47.863663
1175	13	KF_AI7r7Utg	COVERเพลงเก่าเพราะๆ ฟังไปจิบไป [ รักเธอให้น้อยลง,ขอบใจที่พูดแรง,ไม่ไว้ใจตัวเอง]【LONGPLAY】	https://i.ytimg.com/vi/KF_AI7r7Utg/mqdefault.jpg	\N	60 Minutes Longplay	33	2026-05-29 02:37:47.868026
1176	13	hW1kmkxuXRs	รวมเพลงฟังสบาย ฮิตเป็นล้านวิว [ภาพจำ,ดวงเดือน,สองใจ ]【LONGPLAY】	https://i.ytimg.com/vi/hW1kmkxuXRs/mqdefault.jpg	\N	60 Minutes Longplay	34	2026-05-29 02:37:47.873247
1177	13	yf4VB5gV7uA	รวมเพลงฟังสบาย สไตล์ล้านตลับ [แพ้ใจ,รักยิ่งใหญ่จากชายคนหนึ่ง,พักตรงนี้]【LONGPLAY】	https://i.ytimg.com/vi/yf4VB5gV7uA/mqdefault.jpg	\N	60 Minutes Longplay	35	2026-05-29 02:37:47.877823
1178	13	Nqhs_OaJAMc	เพลงเก่า  โคตรเพราะ เพราะโคตร [เจ้าสาวที่กลัวฝน , ยามเมื่อลมพัดหวน,รัก..โลกาภิวัตน์]【LONGPLAY】	https://i.ytimg.com/vi/Nqhs_OaJAMc/mqdefault.jpg	\N	60 Minutes Longplay	36	2026-05-29 02:37:47.883416
1179	13	F0pHSIBEwDo	SUNDAY SPECIAL -  CAFÉ OF LOVE เพลงรักในร้านกาแฟ [Chill ,คาเฟ่ ,ฟังสบาย]【LONGPLAY】	https://i.ytimg.com/vi/F0pHSIBEwDo/mqdefault.jpg	\N	60 Minutes Longplay	37	2026-05-29 02:37:47.887982
1180	13	-BeLnQNI7Mg	รวมเพลงฟังสบายๆเพราะๆ (เพลงน่าฟัง เพลงฮิตเพลงดังในtiktok)【LONGPLAY】	https://i.ytimg.com/vi/-BeLnQNI7Mg/mqdefault.jpg	\N	60 Minutes Longplay	38	2026-05-29 02:37:47.892621
1181	13	956rvSZDnns	เพลงเก่า แบบชิลๆ [ เพลงเก่า,ฮิตสุดๆ,CAFE ]【LONGPLAY】	https://i.ytimg.com/vi/956rvSZDnns/mqdefault.jpg	\N	60 Minutes Longplay	39	2026-05-29 02:37:47.896913
1182	13	E5S44Rz05tA	PLAYLIST - เบิร์ด ธงไชย สบายๆในร้านกาแฟ  【LONGPLAY】	https://i.ytimg.com/vi/E5S44Rz05tA/mqdefault.jpg	\N	60 Minutes Longplay	40	2026-05-29 02:37:47.901589
1183	13	uP_um3dhlEY	PLAYLIST -  เธอน่ารักเหมือนแมวเลยนะ [PERSES,เจมีไนน์,-LAZ1]【LONGPLAY】	https://i.ytimg.com/vi/uP_um3dhlEY/mqdefault.jpg	\N	60 Minutes Longplay	41	2026-05-29 02:37:47.906005
1184	13	80haLbNiV4k	PLAYLIST -   บรรยากาศดีๆ กับเพลงโดนๆ【LONGPLAY】	https://i.ytimg.com/vi/80haLbNiV4k/mqdefault.jpg	\N	60 Minutes Longplay	42	2026-05-29 02:37:47.911212
1185	13	vxcwALUBtoM	PLAYLIST -  ปลายฝน ต้นหนาว【LONGPLAY】	https://i.ytimg.com/vi/vxcwALUBtoM/mqdefault.jpg	\N	60 Minutes Longplay	43	2026-05-29 02:37:47.915573
1186	13	JhObRZMHwcI	จะชิลอะไรเบอร์นั้น  [ซ่อนกลิ่น,,ดอกราตรี ,Please]【LONGPLAY】	https://i.ytimg.com/vi/JhObRZMHwcI/mqdefault.jpg	\N	60 Minutes Longplay	44	2026-05-29 02:37:47.919827
1187	13	w_dofFJaJpc	ถ้าเหนื่อยนัก ก็ไปพักใจที่บ้านก่อน  [เพลงเดินทาง,เพลงคิดถึง]【LONGPLAY】	https://i.ytimg.com/vi/w_dofFJaJpc/mqdefault.jpg	\N	60 Minutes Longplay	45	2026-05-29 02:37:47.923937
1188	13	efbNuSab74A	เพลงฮิตฟังสบายๆ ฟังได้ทุกเวลา [เพลงเก่า /เพลงยุค90/เพลงยุค2000]【LONGPLAY】	https://i.ytimg.com/vi/efbNuSab74A/mqdefault.jpg	\N	60 Minutes Longplay	46	2026-05-29 02:37:47.928244
1189	13	9NaqkoHcXXs	VERY CHILL  [ฟังสบายตอนทำงาน อ่านหนังสือ ขับรถ ในคาเฟ่]【LONGPLAY】	https://i.ytimg.com/vi/9NaqkoHcXXs/mqdefault.jpg	\N	60 Minutes Longplay	47	2026-05-29 02:37:47.932387
1190	13	2JlLyLTzk0Y	รวมเพลง พักบ้างอะไรบ้าง [พักตรงนี้,ดาว,คิดถึงพี่ไหม ]【LONGPLAY】	https://i.ytimg.com/vi/2JlLyLTzk0Y/mqdefault.jpg	\N	60 Minutes Longplay	48	2026-05-29 02:37:47.936955
1191	13	0qvLibg_K-w	รวมเพลง ก็ฉันคิดถึงเธอมันคิดถึง ไม่รู้ว่าจะทำเช่นไร  [ดวงเดือน,Undo,อยากหยุดเวลา]【LONGPLAY】	https://i.ytimg.com/vi/0qvLibg_K-w/mqdefault.jpg	\N	60 Minutes Longplay	49	2026-05-29 02:37:47.941494
1192	13	mtiq36vz0NQ	รวมเพลง ฝนตกที่หน้าต่าง หนาวถึงคนทางนู้นไหม    【LONGPLAY】	https://i.ytimg.com/vi/mtiq36vz0NQ/mqdefault.jpg	\N	60 Minutes Longplay	50	2026-05-29 02:37:47.94593
1193	13	7jum1G4HO4g	รวมเพลง ทำงานง่วงจัง โด๊บเพลงเพราะดีกว่า 【LONGPLAY】	https://i.ytimg.com/vi/7jum1G4HO4g/mqdefault.jpg	\N	60 Minutes Longplay	51	2026-05-29 02:37:47.950081
1194	13	bm_h7wxJpsk	LONGPLAY :  เพลงชิล เที่ยวทิพย์ 【LONGPLAY】	https://i.ytimg.com/vi/bm_h7wxJpsk/mqdefault.jpg	\N	60 Minutes Longplay	52	2026-05-29 02:37:47.954106
1195	13	0MzE55t6wRk	Calories Blah Blah COFFE DAY เพลงเพราะจิบกาแฟ   【LONGPLAY】	https://i.ytimg.com/vi/0MzE55t6wRk/mqdefault.jpg	\N	60 Minutes Longplay	53	2026-05-29 02:37:47.958022
1196	13	e5wmTbfvajs	LONGPLAY : RAINNY SEASON [ฟังเพลงหน้าฝน]【LONGPLAY】	https://i.ytimg.com/vi/e5wmTbfvajs/mqdefault.jpg	\N	60 Minutes Longplay	54	2026-05-29 02:37:47.962538
1197	13	Vc_i0ark4o0	รวมเพลง วันที่เงียบเหงา ทะเลและท้องฟ้าจะโอบเราไว้ 【LONGPLAY】	https://i.ytimg.com/vi/Vc_i0ark4o0/mqdefault.jpg	\N	60 Minutes Longplay	55	2026-05-29 02:37:47.966598
1198	13	gmYNCpa-Ddk	รวมเพลง ลืมไปไม่รักกัน [ คนเจ้าน้ำตา ,ขอบใจที่พูดแรง, อยู่ดีดีก็อยากร้องไห้]【LONGPLAY】	https://i.ytimg.com/vi/gmYNCpa-Ddk/mqdefault.jpg	\N	60 Minutes Longplay	56	2026-05-29 02:37:47.971611
1199	13	9ZrmBiAhGUU	LONGPLAY ความสุขก็เกิดขึ้นได้ง่ายๆ ด้วยการมองท้องฟ้าเงียบๆ 【LONGPLAY】	https://i.ytimg.com/vi/9ZrmBiAhGUU/mqdefault.jpg	\N	60 Minutes Longplay	57	2026-05-29 02:37:47.975871
1200	13	_jeGpbssqSQ	รวมเพลงอารมณ์ดี แฮปปี้มาก [CAFE/TRAVEL/RELAX]【LONGPLAY】	https://i.ytimg.com/vi/_jeGpbssqSQ/mqdefault.jpg	\N	60 Minutes Longplay	58	2026-05-29 02:37:47.980024
1752	19	H1xu44kH5BE	Morgan Wallen - I Got Better (The Shop Sessions)	https://i.ytimg.com/vi/H1xu44kH5BE/mqdefault.jpg	\N	Morgan Wallen	35	2026-06-01 00:26:26.032146
1201	13	Ty8zcAlMBvE	ให้เพลงฮีลใจ ให้ร่างกายได้พัก [cafe/พักผ่อน/ทำงานเพลินๆ]【LONGPLAY】	https://i.ytimg.com/vi/Ty8zcAlMBvE/mqdefault.jpg	\N	60 Minutes Longplay	59	2026-05-29 02:37:47.984752
1202	13	tM-6z8DARlk	รวมเพลง ลื้อดูร้อน [หน้าฝน แต่ทำไมมันร้อนจังอ่ะ ]【LONGPLAY】	https://i.ytimg.com/vi/tM-6z8DARlk/mqdefault.jpg	\N	60 Minutes Longplay	60	2026-05-29 02:37:47.989254
1203	13	2L8AaBQTzXI	เพลงเก่าเหล่านี้ จำกันได้ป่ะ [เกิดทัน,เพลงเก่า,เพลง90-2000]【LONGPLAY】	https://i.ytimg.com/vi/2L8AaBQTzXI/mqdefault.jpg	\N	60 Minutes Longplay	61	2026-05-29 02:37:47.993941
1204	13	XOQ6IOKgSwE	Cafe Love Songs  ฟังไปจิบไปกับเพลงที่คิดถึง【LONGPLAY】	https://i.ytimg.com/vi/XOQ6IOKgSwE/mqdefault.jpg	\N	60 Minutes Longplay	62	2026-05-29 02:37:47.998236
1205	13	stzCvqutwLc	SUNDAY SPECIAL -  เพลงเพลินๆ กับวิวชิลๆ 【LONGPLAY】	https://i.ytimg.com/vi/stzCvqutwLc/mqdefault.jpg	\N	60 Minutes Longplay	63	2026-05-29 02:37:48.002678
1206	13	8lAwutCk4mY	เพลงเพราะ ถ้านอนน้อย ต้องนอนนะ【LONGPLAY】	https://i.ytimg.com/vi/8lAwutCk4mY/mqdefault.jpg	\N	60 Minutes Longplay	64	2026-05-29 02:37:48.007178
1207	13	l0gq6uC2WbQ	SUNDAY SPECIAL -  ยังไม่ทันเข้างาน ก็อยากกลับบ้านแล้ว [ เพลงฟังแก้เครียด] 【LONGPLAY】	https://i.ytimg.com/vi/l0gq6uC2WbQ/mqdefault.jpg	\N	60 Minutes Longplay	65	2026-05-29 02:37:48.011295
1208	13	Vq00AabH8ZA	เพลงเก่าเพราะไว้ฟังตอนเงียบๆ [เพลงเก่า80,เพลงเก่า90,ฟังคลายเครียด]【LONGPLAY】	https://i.ytimg.com/vi/Vq00AabH8ZA/mqdefault.jpg	\N	60 Minutes Longplay	66	2026-05-29 02:37:48.016136
1209	13	-i4HhM7uMvo	เพลงเก่า  ฟังเพลินเดินทาง ทำงานก็ฟังดี  [เธอมีจริง,คือฉันรักเธอ,ใจคอ]【LONGPLAY】	https://i.ytimg.com/vi/-i4HhM7uMvo/mqdefault.jpg	\N	60 Minutes Longplay	67	2026-05-29 02:37:48.020575
1210	13	Fn3Ye4Mg96E	รวมเพลง ทำงาน ด้วยความอารมณ์ดี  [เพลงฟังทำงาน ,เพลงชิล ]【LONGPLAY】	https://i.ytimg.com/vi/Fn3Ye4Mg96E/mqdefault.jpg	\N	60 Minutes Longplay	68	2026-05-29 02:37:48.025487
1211	13	KupDmksHVbg	รวมเพลงเพราะน่าฟัง  นั่งในร้านกาแฟ [CHILL,CAFE,COFFEE]【LONGPLAY】	https://i.ytimg.com/vi/KupDmksHVbg/mqdefault.jpg	\N	60 Minutes Longplay	69	2026-05-29 02:37:48.036187
1212	13	uXWb9veU2FU	SUMMER LOVE เพลงน่ารัก คลายร้อน [น้อง,ฤดูร้อน,นวด,โอ้ทะเล]【LONGPLAY】	https://i.ytimg.com/vi/uXWb9veU2FU/mqdefault.jpg	\N	60 Minutes Longplay	70	2026-05-29 02:37:48.04157
1213	13	ITzW4RBSHzM	เหนื่อยจากงาน เพลียจากหัวหน้า ฟังเพลงคลายเครียดดีกว่า【LONGPLAY】	https://i.ytimg.com/vi/ITzW4RBSHzM/mqdefault.jpg	\N	60 Minutes Longplay	71	2026-05-29 02:37:48.046576
1214	13	8nht9p3cD6c	รวมเพลง ฤดูร้อน ฤดูร็อก [ไม่เป็นรอง ,ทรงอย่างแบด ,นะหน้าทอง]【LONGPLAY】	https://i.ytimg.com/vi/8nht9p3cD6c/mqdefault.jpg	\N	60 Minutes Longplay	72	2026-05-29 02:37:48.052063
1215	13	pMXUeljMSto	เพลงเก่า 90-2000's :  สาดใจมาดิค้าบ สาดน้ำมาทำไม [แซวหญิง,จีบสาว]【LONGPLAY】	https://i.ytimg.com/vi/pMXUeljMSto/mqdefault.jpg	\N	60 Minutes Longplay	73	2026-05-29 02:37:48.056568
1216	13	JcLfhCrmzek	รวมเพลง ทางกลับบ้าน ที่มีคนรักรอเราอยู่【LONGPLAY】	https://i.ytimg.com/vi/JcLfhCrmzek/mqdefault.jpg	\N	60 Minutes Longplay	74	2026-05-29 02:37:48.061382
1217	13	_WT6WYB0x9s	SUNDAY SPECIAL : CHILL 90's - 2000's เพลงเก่า ดีต่อใจ【LONGPLAY】	https://i.ytimg.com/vi/_WT6WYB0x9s/mqdefault.jpg	\N	60 Minutes Longplay	75	2026-05-29 02:37:48.065865
1218	13	mzKSP1Jxr14	Cassette Hits เพลงฟังขับรถ ร้องสนุกมาก 【LONGPLAY】	https://i.ytimg.com/vi/mzKSP1Jxr14/mqdefault.jpg	\N	60 Minutes Longplay	76	2026-05-29 02:37:48.070123
1219	13	DZuEUFePXFU	Private video		\N		77	2026-05-29 02:37:48.07585
1220	13	9JiyhKvhhlA	PLAYLIST GOOD DAY SATURDAY [เพลงคาเฟ่,เพลงฟังทำงาน,เพลงฟังวันหยุด]【LONGPLAY】	https://i.ytimg.com/vi/9JiyhKvhhlA/mqdefault.jpg	\N	60 Minutes Longplay	78	2026-05-29 02:37:48.080554
1221	13	wt7Ro3ZMLww	รวมเพลง อยู่บ้านฟังเพลง มันก็สบายใจดีนะ [R U OK?,ชัดเจน, เรื่องดีๆ ]【LONGPLAY】	https://i.ytimg.com/vi/wt7Ro3ZMLww/mqdefault.jpg	\N	60 Minutes Longplay	79	2026-05-29 02:37:48.085144
1222	13	YW_E_YU9sgc	SUNDAY SPECIAL -  GOOD NIGHT SONGS  ฝันดีราตรีสวัสดิ์ [ เพลงชิล,Lo-Fi Music] 【LONGPLAY】	https://i.ytimg.com/vi/YW_E_YU9sgc/mqdefault.jpg	\N	60 Minutes Longplay	80	2026-05-29 02:37:48.089557
1223	13	lenoN2V0bSk	รวมเพลง ทำใจแล้วทำงาน [ถ้าเธอรักฉันจริง,ทิ้งไว้กลางทาง,หลอกให้รัก ]【LONGPLAY】	https://i.ytimg.com/vi/lenoN2V0bSk/mqdefault.jpg	\N	60 Minutes Longplay	81	2026-05-29 02:37:48.09403
1224	13	eh3PX1A_YLY	CAFÉ MOOD คาเฟ่ คาใจ [R U OK?,Happy Anniversary,ที่สุดในโลก]【LONGPLAY】	https://i.ytimg.com/vi/eh3PX1A_YLY/mqdefault.jpg	\N	60 Minutes Longplay	82	2026-05-29 02:37:48.098549
1225	13	m6IazCNXi50	ขับรถฟังเพลง ร้องตาม ฟังเพลิน [PLEASE, ระหว่างที่รอเขา,เกิดมาแค่รักกัน]【LONGPLAY】	https://i.ytimg.com/vi/m6IazCNXi50/mqdefault.jpg	\N	60 Minutes Longplay	83	2026-05-29 02:37:48.102828
1226	13	7pMoTu3sEtg	HELLO MONDAY  ทำงานฟังเพลงเก่าเพราะ [80's-90's สวัสดีวันจันทร์     ]【LONGPLAY】	https://i.ytimg.com/vi/7pMoTu3sEtg/mqdefault.jpg	\N	60 Minutes Longplay	84	2026-05-29 02:37:48.107333
1227	13	_ID_YFiDUuY	SUNDAY SPECIAL - กางเต๊นท์ แคมป์ปิ้ง เปิดเพลงชิล์  [นะหน้าทอง,สลักจิต]【LONGPLAY】	https://i.ytimg.com/vi/_ID_YFiDUuY/mqdefault.jpg	\N	60 Minutes Longplay	85	2026-05-29 02:37:48.111946
1228	13	igI3vVGPGQU	RETRO HITS เพลงเก่าฟังตอนทำงาน【LONGPLAY】	https://i.ytimg.com/vi/igI3vVGPGQU/mqdefault.jpg	\N	60 Minutes Longplay	86	2026-05-29 02:37:48.11641
1229	13	_heVG8MVFrU	รวมเพลงดัง ONE HITS WONDER ฟังเพลินทำงาน [เพลงเก่า,วายทูเค,Y2K]【LONGPLAY】	https://i.ytimg.com/vi/_heVG8MVFrU/mqdefault.jpg	\N	60 Minutes Longplay	87	2026-05-29 02:37:48.121367
1230	13	0QsCmwTGRpE	เพลงป๊อบเพราะๆในตำนาน ขุดมาฟัง [เพิ่งเข้าใจ,ฝันกลางวัน, เสียงเล็ก ๆ]【LONGPLAY】	https://i.ytimg.com/vi/0QsCmwTGRpE/mqdefault.jpg	\N	60 Minutes Longplay	88	2026-05-29 02:37:48.125675
1231	13	ubVWbtj3_ko	HAPPY MODE ฟังได้ทุกเวลา [ ทรงอย่างแบด ,น้อง, ไม่ตอบเลยน้า ]【LONGPLAY】	https://i.ytimg.com/vi/ubVWbtj3_ko/mqdefault.jpg	\N	60 Minutes Longplay	89	2026-05-29 02:37:48.130397
1232	13	EVdrVKg7GTA	เพลงเก่าสุดฮิต ไม่ได้ฟังนานแล้วนะ [DA endorphine,น้ำชา ชีรณัฐ,บอย Peacemaker ]【LONGPLAY】	https://i.ytimg.com/vi/EVdrVKg7GTA/mqdefault.jpg	\N	60 Minutes Longplay	90	2026-05-29 02:37:48.139038
1233	13	7jK6U64nP_U	ทำงานไป ฟังเพลงไป คิดถึงเรื่องเที่ยวไป [อ้าว,ถ้าชาติหน้ามีจริง,Oh...baby]【LONGPLAY】	https://i.ytimg.com/vi/7jK6U64nP_U/mqdefault.jpg	\N	60 Minutes Longplay	91	2026-05-29 02:37:48.143851
1234	13	5PvzmBFmCXM	เพลงดัง ฟังไปเรื่อยๆ  【LONGPLAY】	https://i.ytimg.com/vi/5PvzmBFmCXM/mqdefault.jpg	\N	60 Minutes Longplay	92	2026-05-29 02:37:48.148574
1235	13	a6ak6el2XME	SUNDAY SPECIAL  : HAPPY DAY PLAYLIST ในวันที่ฉันมีความสุข【LONGPLAY】	https://i.ytimg.com/vi/a6ak6el2XME/mqdefault.jpg	\N	60 Minutes Longplay	93	2026-05-29 02:37:48.152731
1236	13	QzY9Ft57Oas	เพลงเดินทาง ฟังแล้วไม่ง่วง 2 [ เนื้อคู่,รักเธอ 24 ชั่วโมง,ทรงอย่างแบด ]【LONGPLAY】	https://i.ytimg.com/vi/QzY9Ft57Oas/mqdefault.jpg	\N	60 Minutes Longplay	94	2026-05-29 02:37:48.157251
1237	13	PCCcukzXT44	SUNDAY SPECIAL  :  CHILL ON THE BED เพลงชิลฟังก่อนนอน【LONGPLAY】	https://i.ytimg.com/vi/PCCcukzXT44/mqdefault.jpg	\N	60 Minutes Longplay	95	2026-05-29 02:37:48.163288
1238	13	r148agPxUhI	Relax mode พักใจ พักสายตา [หนุ่ม กะลา,นนท์ ธนนท์,Three Man Down]【LONGPLAY】	https://i.ytimg.com/vi/r148agPxUhI/mqdefault.jpg	\N	60 Minutes Longplay	96	2026-05-29 02:37:48.167807
1239	13	aK08EBWa0M8	COFFEE TIMES ร่างกายต้องการคาเฟอีน และเพลงเพราะ【LONGPLAY】	https://i.ytimg.com/vi/aK08EBWa0M8/mqdefault.jpg	\N	60 Minutes Longplay	97	2026-05-29 02:37:48.172106
1240	13	DOGikU0t2Kc	SUNDAY SPECIAL -  CHILLING MOOD 【LONGPLAY】	https://i.ytimg.com/vi/DOGikU0t2Kc/mqdefault.jpg	\N	60 Minutes Longplay	98	2026-05-29 02:37:48.176569
1241	13	dAEQSTrb4x8	อากาศดีๆ มาฟังเพลงดีๆกัน [หนุ่ม กะลา,โจอี้  ภูวศิษฐ์ ,นนท์  ธนนท์ ]【LONGPLAY】	https://i.ytimg.com/vi/dAEQSTrb4x8/mqdefault.jpg	\N	60 Minutes Longplay	99	2026-05-29 02:37:48.180759
1242	13	wxy7F_4qonE	เพลงเดินทาง ฟังแล้วไม่ง่วง [ ดึงดัน,วันที่ได้คำตอบ,คือเธอใช่ไหม]【LONGPLAY】	https://i.ytimg.com/vi/wxy7F_4qonE/mqdefault.jpg	\N	60 Minutes Longplay	100	2026-05-29 02:37:48.185342
1243	13	R-FeQqGnf1U	หนีงาน มาฟังเพลงเพลินๆ [โปรดส่งใครมารักฉันที,ทำไมต้องเธอ,ให้ฉันดูแลเธอ]【LONGPLAY】	https://i.ytimg.com/vi/R-FeQqGnf1U/mqdefault.jpg	\N	60 Minutes Longplay	101	2026-05-29 02:37:48.190095
1244	13	eTCsQSvkl3w	งานท่วมหัว  ทำตัว slow life [เพลงเก่างดังฟังตอนทำงาน]【LONGPLAY】	https://i.ytimg.com/vi/eTCsQSvkl3w/mqdefault.jpg	\N	60 Minutes Longplay	102	2026-05-29 02:37:48.195042
1245	13	dlAFk039bIU	วันจันทร์ มาฟังเพลงเก่ากันดีกว่า [ใจเอย,น้ำค้างตอนเช้า,เล่าสู่กันฟัง]【LONGPLAY】	https://i.ytimg.com/vi/dlAFk039bIU/mqdefault.jpg	\N	60 Minutes Longplay	103	2026-05-29 02:37:48.19983
1246	13	AVnLIvSgBOo	รวมเพลง อยากชิล ก็ฟังเพลงชิล【LONGPLAY】	https://i.ytimg.com/vi/AVnLIvSgBOo/mqdefault.jpg	\N	60 Minutes Longplay	104	2026-05-29 02:37:48.204673
1247	13	T5M7Y2cDuos	สวัสดีวันจันทร์ ฟังเพลงดังให้มันคึกคัก【LONGPLAY】	https://i.ytimg.com/vi/T5M7Y2cDuos/mqdefault.jpg	\N	60 Minutes Longplay	105	2026-05-29 02:37:48.209469
1248	13	kfhWtbtOek0	ฟังเพลงเพราะ เพลงดัง ฟังตอนขับรถ [พันหมื่นเหตุผล,เรื่องที่ขอ,เมื่อวาน]【LONGPLAY】	https://i.ytimg.com/vi/kfhWtbtOek0/mqdefault.jpg	\N	60 Minutes Longplay	106	2026-05-29 02:37:48.214288
1249	13	atmCAYfkUQY	รวมเพลง ขี้เกียจทำงาน แอบฟังเพลงเพราะดีกว่า [เพลงชิล คัดมาแล้ว ]【LONGPLAY】	https://i.ytimg.com/vi/atmCAYfkUQY/mqdefault.jpg	\N	60 Minutes Longplay	107	2026-05-29 02:37:48.218592
1250	13	12AdlGNH-qY	เพลงเก่าเพราะๆ เพลงร้านกาแฟ ฟังเพลินยามเช้า  [ที่แล้วก็แล้วไป,บทเรียนสุดท้าย]【LONGPLAY】	https://i.ytimg.com/vi/12AdlGNH-qY/mqdefault.jpg	\N	60 Minutes Longplay	108	2026-05-29 02:37:48.223518
1251	13	bAuKWkzcIdI	BATTERY DAY  - เพลงเก่า เติมกำลังใจในวันอ่อนแอ [อย่าเอาน้ำตากลับบ้าน,ก้อนหินก้อนนั้น]【LONGPLAY】	https://i.ytimg.com/vi/bAuKWkzcIdI/mqdefault.jpg	\N	60 Minutes Longplay	109	2026-05-29 02:37:48.227618
1252	13	X0jAcnpmjI0	เพลงเพราะ ทิ้งงาน มาฟังเพลงฮิต   [สองใจ,ซ่อนกลิ่น,นะหน้าทอง,ลมเปลี่ยนทิศ]【LONGPLAY】	https://i.ytimg.com/vi/X0jAcnpmjI0/mqdefault.jpg	\N	60 Minutes Longplay	110	2026-05-29 02:37:48.232704
1253	13	tp-vs527Weg	SUNDAY SPECIAL :  GOOD TIMES  OLD SONGS   -เพลงเก่าดัง ฟังแล้วอารมณ์ดี 【LONGPLAY】	https://i.ytimg.com/vi/tp-vs527Weg/mqdefault.jpg	\N	60 Minutes Longplay	111	2026-05-29 02:37:48.237267
1254	13	GjzOU5JaGYY	TIMES To RELAX พักใจไปฟังเพลง  [ สลักจิต,ขวัญเอยขวัญมา,พิง]【LONGPLAY】	https://i.ytimg.com/vi/GjzOU5JaGYY/mqdefault.jpg	\N	60 Minutes Longplay	112	2026-05-29 02:37:48.241938
1753	19	wZamcq5V61U	TN	https://i.ytimg.com/vi/wZamcq5V61U/mqdefault.jpg	\N	Morgan Wallen - Topic	36	2026-06-01 00:26:26.039843
1255	13	-k8WWSsjCD8	รวมเพลง จิ๊กโก๋ฟังเพลิน แก้เซ็ง [นะหน้าทอง,ลม,ดึงดัน]【LONGPLAY】	https://i.ytimg.com/vi/-k8WWSsjCD8/mqdefault.jpg	\N	60 Minutes Longplay	113	2026-05-29 02:37:48.246508
1256	13	tQqMbc1AtwE	เพลงเพราะ  ทิ้งงาน มาฟังเพลงชิล [เจ้าชายนิทรา, รักไม่ต้องการเวลา,รออยู่ตรงนี้]【LONGPLAY】	https://i.ytimg.com/vi/tQqMbc1AtwE/mqdefault.jpg	\N	60 Minutes Longplay	114	2026-05-29 02:37:48.251279
1257	13	oMyqe3nTNhk	SUNDAY SPECIAL - งานเหนื่อยจัง ฟังเพลงเพราะกันดีกว่า [ฟังยาวจุใจ 2 ชั่วโมง]【LONGPLAY】	https://i.ytimg.com/vi/oMyqe3nTNhk/mqdefault.jpg	\N	60 Minutes Longplay	115	2026-05-29 02:37:48.255788
1258	13	dyY0SrTUFos	เพลง อารมณ์ดี ร้านกาแฟ [ทำไมต้องรักเธอ,มีเราตลอดไป,เราถูกสร้างมาเพื่อกันและกัน]【LONGPLAY】	https://i.ytimg.com/vi/dyY0SrTUFos/mqdefault.jpg	\N	60 Minutes Longplay	116	2026-05-29 02:37:48.260273
1259	13	mJmVxRdrhdM	รวมเพลง ปล่อยจอย  ปล่อยใจ  หยุดใช้สมองกันเหอะ  lฟังตอนทำงาน / cafe l【LONGPLAY】	https://i.ytimg.com/vi/mJmVxRdrhdM/mqdefault.jpg	\N	60 Minutes Longplay	117	2026-05-29 02:37:48.264324
1260	13	OxhAC2CnRts	เพลงฟังสบายๆ ทำงาน - เพลงยุค 90-2000 [อย่าดีกว่า, เขียนไว้ข้างเตียง,เธอบอกให้ลืม]【LONGPLAY】	https://i.ytimg.com/vi/OxhAC2CnRts/mqdefault.jpg	\N	60 Minutes Longplay	118	2026-05-29 02:37:48.268154
1261	13	pPFpy54-auA	เพลงเพราะๆ ฟังแก้เบื่อ [Good Morning Teacher,พริบตา,ซ่อนกลิ่น]【LONGPLAY】	https://i.ytimg.com/vi/pPFpy54-auA/mqdefault.jpg	\N	60 Minutes Longplay	119	2026-05-29 02:37:48.27279
1262	13	bI7d8tN1oik	เพลง CHILL  เพราะๆ ฟังได้ทุกเวลา [เหงา,สิ่งสำคัญ,เธอยัง...]【LONGPLAY】	https://i.ytimg.com/vi/bI7d8tN1oik/mqdefault.jpg	\N	60 Minutes Longplay	120	2026-05-29 02:37:48.276952
1263	13	5hj3esrhGW4	ฟังก่อนนอน ก็เพลินดีนะ [พักตรงนี้,ความรักจากฉัน,เพื่อเธอ ตลอดไป]【LONGPLAY】	https://i.ytimg.com/vi/5hj3esrhGW4/mqdefault.jpg	\N	60 Minutes Longplay	121	2026-05-29 02:37:48.281611
1264	13	IFLsyZg_rTw	เพลงเก่าหาฟังยาก ฟังชิลเว่อร์ [แพ้คนสวย,ก่อนมะลิบาน,บอกฉันบอกเธอ]【LONGPLAY】	https://i.ytimg.com/vi/IFLsyZg_rTw/mqdefault.jpg	\N	60 Minutes Longplay	122	2026-05-29 02:37:48.286412
1265	13	L_OKd8E6NkI	รวมเพลงขับรถฟังเพลิน ทำงานฟังฟิน [ไม่แก่ตาย,สิ่งที่ตามหา,ผงาดง้ำค้ำโลก] 【LONGPLAY】	https://i.ytimg.com/vi/L_OKd8E6NkI/mqdefault.jpg	\N	60 Minutes Longplay	123	2026-05-29 02:37:48.29089
1266	13	9xO5e7o1-vQ	รวมเพลง ให้เพลงเก่าเพราะๆ  ฮีลความรู้สึก [ปราสาททราย,คนไม่มีวาสนา,สงสารกันหน่อย] 【LONGPLAY】	https://i.ytimg.com/vi/9xO5e7o1-vQ/mqdefault.jpg	\N	60 Minutes Longplay	124	2026-05-29 02:37:48.295633
1267	13	_GL1VNkNSsY	รวมเพลง  ทำงานแบบมีความหวัง และกำลังใจ [ก้อนหินก้อนนั้น,ครึ่งหนึ่งของชีวิต]【LONGPLAY】	https://i.ytimg.com/vi/_GL1VNkNSsY/mqdefault.jpg	\N	60 Minutes Longplay	125	2026-05-29 02:37:48.299877
1268	13	27IW9FeKyH0	SUNDAY SPECIAL : เพลงชิล วันทำงาน [ฟังสบาย]【LONGPLAY】	https://i.ytimg.com/vi/27IW9FeKyH0/mqdefault.jpg	\N	60 Minutes Longplay	126	2026-05-29 02:37:48.304596
1269	13	KaIVzlV-dug	รวมเพลง งานก็หนัก  มาพักฟังเพลงเศร้าเพราะๆกัน  [เรื่องจริงก็คือ..,ดวงเดือน, Undo]【LONGPLAY】	https://i.ytimg.com/vi/KaIVzlV-dug/mqdefault.jpg	\N	60 Minutes Longplay	127	2026-05-29 02:37:48.309008
1270	13	EfunmsHIVA0	รวมเพลง ลูกกรุงดัง รุ่นเดอะ ฟังเพลินๆ [วิมานดิน ,ขอจันทร์,สนามอารมณ์ ]【LONGPLAY】	https://i.ytimg.com/vi/EfunmsHIVA0/mqdefault.jpg	\N	60 Minutes Longplay	128	2026-05-29 02:37:48.313067
1271	13	00skuN62pfg	เพลงเก่า หายังยาก ฟังชิลทำงาน【LONGPLAY】	https://i.ytimg.com/vi/00skuN62pfg/mqdefault.jpg	\N	60 Minutes Longplay	129	2026-05-29 02:37:48.316872
1272	13	NG1tXcbhM-o	SUNDAY SPECIAL : Good Night Cover [เบิร์ด ธงไชย , PEACEMAKER,Da Endorphine]【LONGPLAY】	https://i.ytimg.com/vi/NG1tXcbhM-o/mqdefault.jpg	\N	60 Minutes Longplay	130	2026-05-29 02:37:48.321437
1273	13	PMWEyjpqhkM	เพลงเพราะ ชิลเฟร่อ 4【LONGPLAY】	https://i.ytimg.com/vi/PMWEyjpqhkM/mqdefault.jpg	\N	60 Minutes Longplay	131	2026-05-29 02:37:48.325615
1274	13	st402-i3IYA	เพลงเพราะ ชิลเฟร่อ 3【LONGPLAY】	https://i.ytimg.com/vi/st402-i3IYA/mqdefault.jpg	\N	60 Minutes Longplay	132	2026-05-29 02:37:48.329719
1275	13	d_xFG9zZ_sg	เพลงเพราะ ชิลเฟร่อ 2【LONGPLAY】ล้านตลับ	https://i.ytimg.com/vi/d_xFG9zZ_sg/mqdefault.jpg	\N	60 Minutes Longplay	133	2026-05-29 02:37:48.333601
1276	13	kQ6AQunNjKA	เพลงเพราะ ชิลเฟร่อ 1 【LONGPLAY】	https://i.ytimg.com/vi/kQ6AQunNjKA/mqdefault.jpg	\N	60 Minutes Longplay	134	2026-05-29 02:37:48.33812
1277	13	g6c1ZbH5Jpk	สตริงล้านวิว ฟังวันทำงานเพลินๆ 【LONGPLAY】	https://i.ytimg.com/vi/g6c1ZbH5Jpk/mqdefault.jpg	\N	60 Minutes Longplay	135	2026-05-29 02:37:48.342169
1278	13	uTnzvt8_4f0	ซัมเมอร์ ฟังเพลิน 2【LONGPLAY】	https://i.ytimg.com/vi/uTnzvt8_4f0/mqdefault.jpg	\N	60 Minutes Longplay	136	2026-05-29 02:37:48.346658
1279	13	EEaN6nYWPIs	รวมเพลง ซัมเมอร์ ฟังเพลิน 1【LONGPLAY】	https://i.ytimg.com/vi/EEaN6nYWPIs/mqdefault.jpg	\N	60 Minutes Longplay	137	2026-05-29 02:37:48.351105
1280	13	sYakYV8uKPU	Sunday Special : COFFEE TIME [cafe/chill/working ] [ฟังยาวสะใจ 2 ชั่วโมง]【LONGPLAY】	https://i.ytimg.com/vi/sYakYV8uKPU/mqdefault.jpg	\N	60 Minutes Longplay	138	2026-05-29 02:37:48.355966
1281	13	NLUdDDJEHwg	ดนตรีผ่อนคลาย ฟังสบายใน Café	https://i.ytimg.com/vi/NLUdDDJEHwg/mqdefault.jpg	\N	GMM สบาย สบาย	139	2026-05-29 02:37:48.360048
1754	19	mogp9wQ269c	180 (Lifestyle)	https://i.ytimg.com/vi/mogp9wQ269c/mqdefault.jpg	\N	Morgan Wallen - Topic	37	2026-06-01 00:26:26.045934
1283	13	V2XektWh14U	ฟังเพลินเพลงเก่า  ยุค 80-90 Ver.1【LONGPLAY】	https://i.ytimg.com/vi/V2XektWh14U/mqdefault.jpg	\N	60 Minutes Longplay	141	2026-05-29 02:37:48.369105
1284	13	BKba5CyhMr4	ทะเลเรียกว่า sea แฟนไม่มีเรียกว่า “โสดมาก”  inspired by #นั่งเล  【LONGPLAY】	https://i.ytimg.com/vi/BKba5CyhMr4/mqdefault.jpg	\N	60 Minutes Longplay	142	2026-05-29 02:37:48.374152
1285	13	xCzTlFScNeE	มานั่งเล ไม่หนีร้อน ก็หนีรัก inspired by #นั่งเล  【LONGPLAY】	https://i.ytimg.com/vi/xCzTlFScNeE/mqdefault.jpg	\N	60 Minutes Longplay	143	2026-05-29 02:37:48.378449
1286	13	JB9-G9qGKdw	ฟังเพลงเพราะ ร้องตามโคตรเพลิน【LONGPLAY】	https://i.ytimg.com/vi/JB9-G9qGKdw/mqdefault.jpg	\N	60 Minutes Longplay	144	2026-05-29 02:37:48.383229
1287	13	VKyoeqCRvFQ	แม้ทะเลจะมีคลื่น แต่ก็คงไม่สดชื่นเท่ามีเธอ2【LONGPLAY】	https://i.ytimg.com/vi/VKyoeqCRvFQ/mqdefault.jpg	\N	60 Minutes Longplay	145	2026-05-29 02:37:48.387319
1288	13	1r_MS2YQHcc	แม้ทะเลจะมีคลื่น แต่ก็คงไม่สดชื่นเท่ามีเธอ 1【LONGPLAY】	https://i.ytimg.com/vi/1r_MS2YQHcc/mqdefault.jpg	\N	60 Minutes Longplay	146	2026-05-29 02:37:48.392891
1289	13	UmOzERxVzvc	ปล่อยใจไปกับความชิล เบิร์ด ธงไชย 【LONGPLAY】	https://i.ytimg.com/vi/UmOzERxVzvc/mqdefault.jpg	\N	60 Minutes Longplay	147	2026-05-29 02:37:48.397383
1290	13	nv-qcSaY-ZI	ปล่อยใจไปกับความชิล  KLEAR & POTATO【LONGPLAY】	https://i.ytimg.com/vi/nv-qcSaY-ZI/mqdefault.jpg	\N	60 Minutes Longplay	148	2026-05-29 02:37:48.402544
1291	13	9_y0VVXd7DU	ปล่อยใจไปกับเพลงเพราะ Jetset’er - Atom【LONGPLAY】	https://i.ytimg.com/vi/9_y0VVXd7DU/mqdefault.jpg	\N	60 Minutes Longplay	149	2026-05-29 02:37:48.40645
1292	13	P8S-fFtpfeQ	ปล่อยใจไปกับเพลงเพราะ  แอม & ศักดา อินคา【LONGPLAY】	https://i.ytimg.com/vi/P8S-fFtpfeQ/mqdefault.jpg	\N	60 Minutes Longplay	150	2026-05-29 02:37:48.410685
1293	13	kQBX3DN1yfk	เห็นทะเลแล้วใจละเมอ เห็นหน้าเธอแล้วใจละลาย Inspired by #นั่งเล 【LONGPLAY】	https://i.ytimg.com/vi/kQBX3DN1yfk/mqdefault.jpg	\N	60 Minutes Longplay	151	2026-05-29 02:37:48.415243
1294	13	_rv7txsfwXA	รวมเพลง นั่งริมเล ฟังเพลง ชิลเพลิน Inspired by #นั่งเล【LONGPLAY】	https://i.ytimg.com/vi/_rv7txsfwXA/mqdefault.jpg	\N	60 Minutes Longplay	152	2026-05-29 02:37:48.419693
1295	13	y1zyx1-zCIE	ร็อกติดดิน ฟังโคตรเพลิน  2【LONGPLAY】	https://i.ytimg.com/vi/y1zyx1-zCIE/mqdefault.jpg	\N	60 Minutes Longplay	153	2026-05-29 02:37:48.423955
1296	13	Dt691yRw6Q8	ร็อกติดดิน ฟังโคตรเพลิน  1 【LONGPLAY】	https://i.ytimg.com/vi/Dt691yRw6Q8/mqdefault.jpg	\N	60 Minutes Longplay	154	2026-05-29 02:37:48.428154
1297	13	683zUFyIRfU	เพลงร็อก ฟังวันทำงาน 2【LONGPLAY】	https://i.ytimg.com/vi/683zUFyIRfU/mqdefault.jpg	\N	60 Minutes Longplay	155	2026-05-29 02:37:48.432013
1298	13	nNnIMaCTy-4	เพลงร็อก ฟังวันทำงาน 1 【LONGPLAY】	https://i.ytimg.com/vi/nNnIMaCTy-4/mqdefault.jpg	\N	60 Minutes Longplay	156	2026-05-29 02:37:48.436819
1299	13	MVYlOJGq4IU	ฮิตดัง ขนกลับมาฟังเพลินๆ【LONGPLAY】	https://i.ytimg.com/vi/MVYlOJGq4IU/mqdefault.jpg	\N	60 Minutes Longplay	157	2026-05-29 02:37:48.44134
1300	13	jaE3G9e99Ik	เพลงดัง ฟังแก้ร้อน  1 [NO MAKEUP ,แค่เธอเข้ามา,โดดเดี่ยวด้วยกัน ]【LONGPLAY】	https://i.ytimg.com/vi/jaE3G9e99Ik/mqdefault.jpg	\N	60 Minutes Longplay	158	2026-05-29 02:37:48.445671
1301	13	fhIr6jpzkdU	เพลงดัง ฟังเพลินแก้เหงา  [สบายดีหรือ,ฝนตกไหม,อยู่ๆก็คิดถึง]【LONGPLAY】	https://i.ytimg.com/vi/fhIr6jpzkdU/mqdefault.jpg	\N	60 Minutes Longplay	159	2026-05-29 02:37:48.449713
1302	13	MHzuoqWwKq8	ทำงานไป ร้องเพลงไป 2 [คู่ชีวิต,ยิ่งรู้จัก ยิ่งรักเธอ,รักเธอคนเดียว]【LONGPLAY】	https://i.ytimg.com/vi/MHzuoqWwKq8/mqdefault.jpg	\N	60 Minutes Longplay	160	2026-05-29 02:37:48.453989
1303	13	w_rKYWHFHjI	ทำงานไป ร้องเพลงไป 1 [รู้,จำฉันได้หรือเปล่า,แค่ได้คิดถึง] 【LONGPLAY】	https://i.ytimg.com/vi/w_rKYWHFHjI/mqdefault.jpg	\N	60 Minutes Longplay	161	2026-05-29 02:37:48.458102
1304	13	K20mg5yH75I	เพลงละครดัง เพราะทุกครั้งที่ได้ฟัง 【LONGPLAY】	https://i.ytimg.com/vi/K20mg5yH75I/mqdefault.jpg	\N	60 Minutes Longplay	162	2026-05-29 02:37:48.462866
1305	13	Fd_Opi-SlKk	เพลงเก่าฟังเพลิน 2 [อะไรก็ยอม,รู้,ถ้า]【LONGPLAY】	https://i.ytimg.com/vi/Fd_Opi-SlKk/mqdefault.jpg	\N	60 Minutes Longplay	163	2026-05-29 02:37:48.466976
1306	13	WQcQjiN7lcM	เพลงเก่าฟังเพลิน 1 [เธอมีจริง,คือฉันรักเธอ,เธอเปลี่ยนไป]【LONGPLAY】	https://i.ytimg.com/vi/WQcQjiN7lcM/mqdefault.jpg	\N	60 Minutes Longplay	164	2026-05-29 02:37:48.471388
1307	13	wFI19W1tU4Q	เพลงเก่า ฟังเพราะ ฟังเพลิน [ขอเพียงที่พักใจ,ทั้งรู้ก็รัก,เติมไม่เต็ม ]【LONGPLAY】	https://i.ytimg.com/vi/wFI19W1tU4Q/mqdefault.jpg	\N	60 Minutes Longplay	165	2026-05-29 02:37:48.475702
1308	13	jMrLSa6zeC8	เพลงเก่าฟังเพลิน โยกตอนทำงาน [คู่กัด,ขอใจเธอคืน,รักน้องคนเดียว]【LONGPLAY】	https://i.ytimg.com/vi/jMrLSa6zeC8/mqdefault.jpg	\N	60 Minutes Longplay	166	2026-05-29 02:37:48.479926
1309	13	KY2LhYEYk94	ฟังมันส์สะใจ ตอนทำงาน!! 【LONGPLAY】	https://i.ytimg.com/vi/KY2LhYEYk94/mqdefault.jpg	\N	60 Minutes Longplay	167	2026-05-29 02:37:48.484072
1310	13	cq1fpjtxFt4	รวมเพลงชิล ร้านกาแฟ & ฟังทำงานชิลๆ  2 【LONGPLAY】	https://i.ytimg.com/vi/cq1fpjtxFt4/mqdefault.jpg	\N	60 Minutes Longplay	168	2026-05-29 02:37:48.488237
1311	13	0dXACBzCbLA	รวมเพลงชิล ร้านกาแฟ & ฟังทำงานชิลๆ  1 [ฟัง,หนึ่งคืน,พริบตา]【LONGPLAY】	https://i.ytimg.com/vi/0dXACBzCbLA/mqdefault.jpg	\N	60 Minutes Longplay	169	2026-05-29 02:37:48.491983
1312	13	FGEZyoj_Fwo	เพลงดัง เพราะแบบไทยๆ ฟังเพลินมาก【LONGPLAY】	https://i.ytimg.com/vi/FGEZyoj_Fwo/mqdefault.jpg	\N	60 Minutes Longplay	170	2026-05-29 02:37:48.496234
1313	13	K41jSNoXdD4	รวมเพลง ฟังเพราะ ชิลเว่อร์ 2 [chill,cafe,travel]【LONGPLAY】	https://i.ytimg.com/vi/K41jSNoXdD4/mqdefault.jpg	\N	60 Minutes Longplay	171	2026-05-29 02:37:48.500741
1314	13	ZoPJh1sazB4	รวมเพลง ฟังเพราะ ชิลเว่อร์ 1[chill , cafe,travel ]【LONGPLAY】	https://i.ytimg.com/vi/ZoPJh1sazB4/mqdefault.jpg	\N	60 Minutes Longplay	172	2026-05-29 02:37:48.505234
1315	13	qdbgIAz2Joc	เพลงร็อก ฟังเพลินฤดูร้อน  [LOSO,SILLY FOOLS,BIGASS ]【LONGPLAY】	https://i.ytimg.com/vi/qdbgIAz2Joc/mqdefault.jpg	\N	60 Minutes Longplay	173	2026-05-29 02:37:48.510096
1316	13	yCZjc75mMvY	เพลงใหม่ชิล ฟังทำงานสบายใจ 1【LONGPLAY】	https://i.ytimg.com/vi/yCZjc75mMvY/mqdefault.jpg	\N	60 Minutes Longplay	174	2026-05-29 02:37:48.514442
1317	13	8jQxgeP1IFM	เพลงเก่าชิลฟังทำงานสบายใจ 1【LONGPLAY】	https://i.ytimg.com/vi/8jQxgeP1IFM/mqdefault.jpg	\N	60 Minutes Longplay	175	2026-05-29 02:37:48.518413
1318	13	L32xr55vn4A	รวมเพลง รวมเพลงฟังสบาย ทำงานเพลินๆหู【LONGPLAY】	https://i.ytimg.com/vi/L32xr55vn4A/mqdefault.jpg	\N	60 Minutes Longplay	176	2026-05-29 02:37:48.523142
1319	13	bpiHWD1tvDs	เพลงเก่าดัง ฟังแล้วอารมณ์ดี Ver 2【LONGPLAY】	https://i.ytimg.com/vi/bpiHWD1tvDs/mqdefault.jpg	\N	60 Minutes Longplay	177	2026-05-29 02:37:48.527373
1320	13	0_Kph2UyX9o	Private video		\N		178	2026-05-29 02:37:48.532016
1321	13	K3J7ymzEoHI	เพลงเก่าดัง cover ฟังเพราะ【LONGPLAY】	https://i.ytimg.com/vi/K3J7ymzEoHI/mqdefault.jpg	\N	60 Minutes Longplay	179	2026-05-29 02:37:48.536222
1322	13	a_M9NwwgEtA	Chill ทุกที่ ฟังโคตรเพลิน 【LONGPLAY】	https://i.ytimg.com/vi/a_M9NwwgEtA/mqdefault.jpg	\N	60 Minutes Longplay	180	2026-05-29 02:37:48.540432
1323	13	EC7jdV3IaFs	รำคาญจัง หาเพลงเพราะฟังดีกว่า [พูดไม่ค่อยถูก,สิ่งดีดี ,สองใจรวมกัน ]【LONGPLAY】	https://i.ytimg.com/vi/EC7jdV3IaFs/mqdefault.jpg	\N	60 Minutes Longplay	181	2026-05-29 02:37:48.544126
1324	13	pA7SSC0NGUE	เพลงร็อกเก่า ฟังทำงานชิลๆ [อำพล ,อัสนี - วสันต์ ,Silly Fools]【LONGPLAY】	https://i.ytimg.com/vi/pA7SSC0NGUE/mqdefault.jpg	\N	60 Minutes Longplay	182	2026-05-29 02:37:48.547885
1325	13	iLznIhM9DKM	เพลงชิลยามบ่าย สบายใจจัง [นิว จิ๋ว,COCKTAIL,พั้นช์]【LONGPLAY】	https://i.ytimg.com/vi/iLznIhM9DKM/mqdefault.jpg	\N	60 Minutes Longplay	183	2026-05-29 02:37:48.551596
1326	13	dZSY2j2wBkU	รวมเพลง ฟังสบาย ฟังได้ทุกคน [Big Ass,POTATO,BOY PEACEMAKER]【LONGPLAY】	https://i.ytimg.com/vi/dZSY2j2wBkU/mqdefault.jpg	\N	60 Minutes Longplay	184	2026-05-29 02:37:48.555596
1327	13	6YwtJViMo4Q	ชิลยาวๆ ตอนบ่าย [ปลิว,คิด(แต่ไม่)ถึง(Same Page?),ยกเว้นเรื่องเธอ]【LONGPLAY】	https://i.ytimg.com/vi/6YwtJViMo4Q/mqdefault.jpg	\N	60 Minutes Longplay	185	2026-05-29 02:37:48.560023
1328	13	5b4LdX8OQ8o	รวมเพลงชิลล์ ฟังแล้วหายเบื่อ [First Lady,ดีอย่างไร,แรงโน้มถ่วง]【LONGPLAY】	https://i.ytimg.com/vi/5b4LdX8OQ8o/mqdefault.jpg	\N	60 Minutes Longplay	186	2026-05-29 02:37:48.564377
1329	13	-u6qBqZkUgQ	เพลงฮิต ร้านกาแฟ อัพเดท 2022 [ฟังเพลิน,cafe,]【LONGPLAY】	https://i.ytimg.com/vi/-u6qBqZkUgQ/mqdefault.jpg	\N	60 Minutes Longplay	187	2026-05-29 02:37:48.568186
1330	13	Bwgq2UCbxlk	รวมเพลง อินดี้ชิลๆ ฟังสบาย [ฟังต่อเนื่อง, คาเฟ่ ]【LONGPLAY】	https://i.ytimg.com/vi/Bwgq2UCbxlk/mqdefault.jpg	\N	60 Minutes Longplay	188	2026-05-29 02:37:48.572536
1331	13	UQ22POJacx4	รวมเพลง ฟังเพลิน เจริญหู  [ดาวกับเม็ดทราย,นอนไม่หลับ,คิดมาก]【LONGPLAY】	https://i.ytimg.com/vi/UQ22POJacx4/mqdefault.jpg	\N	60 Minutes Longplay	189	2026-05-29 02:37:48.576173
1332	13	Zta0pcRllzQ	ร็อคละมุน กับวันสบายๆ  [เธอเอาใจฉันไป,รักอยู่ข้างเธอ,ทุ้มอยู่ในใจ]【LONGPLAY】	https://i.ytimg.com/vi/Zta0pcRllzQ/mqdefault.jpg	\N	60 Minutes Longplay	190	2026-05-29 02:37:48.57996
1333	13	4f1xsA9AR5Q	เพลงเก่าฟังชิลล์ ทำงานเพลิน [วิมานดิน ,วันที่อ่อนไหว,นิยามรัก]【LONGPLAY】	https://i.ytimg.com/vi/4f1xsA9AR5Q/mqdefault.jpg	\N	60 Minutes Longplay	191	2026-05-29 02:37:48.583975
1334	13	6Om3mtaQgnE	เพลงเก่า 90 โยกเพลิน อารมณ์ดี [ฝากเลี้ยง,ไม่รัก...ก็บ้า, ซักกะนิด]【LONGPLAY】	https://i.ytimg.com/vi/6Om3mtaQgnE/mqdefault.jpg	\N	60 Minutes Longplay	192	2026-05-29 02:37:48.588136
1335	13	Xn1EiAR_D48	ฟังเพลงชิล ฮีลใจตอนเหนื่อยๆ [ปาล์มมี่,เจ เจตริน,เบิร์ด ธงไชย]【LONGPLAY】	https://i.ytimg.com/vi/Xn1EiAR_D48/mqdefault.jpg	\N	60 Minutes Longplay	193	2026-05-29 02:37:48.591951
1336	13	EkuXo0S0VoE	เพลงเก่า ชวนพัก ชวนชิล [โปรดส่งใครมารักฉันที,คนน่ารัก,เธอมากับฝน]【LONGPLAY】	https://i.ytimg.com/vi/EkuXo0S0VoE/mqdefault.jpg	\N	60 Minutes Longplay	194	2026-05-29 02:37:48.596092
1337	13	WjuYC1qaR-s	เพลงเพราะๆ ฟังสบายๆ [มันคือความรัก,เรื่องมหัศจรรย์,ที่รัก]【LONGPLAY】	https://i.ytimg.com/vi/WjuYC1qaR-s/mqdefault.jpg	\N	60 Minutes Longplay	195	2026-05-29 02:37:48.599963
1338	13	ldNZXEUO78k	พักสมอง ตอนทำงาน [AROMA,ทะเลสีดำ,เจ้าชายนิทรา]【LONGPLAY】	https://i.ytimg.com/vi/ldNZXEUO78k/mqdefault.jpg	\N	60 Minutes Longplay	196	2026-05-29 02:37:48.604924
1339	13	IMvtvg5JLIQ	HAPPY MOMENT & CHILL TIME [อยู่นี่ไง,รักคำโตโต,คิดถึงจัง ] [เป๊ก ผลิตโชค,DA endorphine]【LONGPLAY】	https://i.ytimg.com/vi/IMvtvg5JLIQ/mqdefault.jpg	\N	60 Minutes Longplay	197	2026-05-29 02:37:48.609654
1340	13	PGaEHWRGfnQ	เพลงเก่ามาก ฟังชิลๆคิดถึงวันวาน [ให้เธอ,วันนั้น..วันนี้..วันไหน,ฝัน..ฝันหวาน]【LONGPLAY】	https://i.ytimg.com/vi/PGaEHWRGfnQ/mqdefault.jpg	\N	60 Minutes Longplay	198	2026-05-29 02:37:48.614143
1546	15	zxhGfUE7_h0	คิดถึงไปก่อน - BOMB AT TRACK Feat.Alien Safeplanet「Official MV」	https://i.ytimg.com/vi/zxhGfUE7_h0/mqdefault.jpg	\N	Genierock	4	2026-05-30 04:08:34.957429
1341	13	n9DtsSjF1fY	ร็อกไทย ฟังเพลิน  [คนรักกัน,อย่าล้อเล่น,ลาจากเธอ] [หนุ่ม กะลา,LOSO]【LONGPLAY】	https://i.ytimg.com/vi/n9DtsSjF1fY/mqdefault.jpg	\N	60 Minutes Longplay	199	2026-05-29 02:37:48.618369
1342	13	99ZICU_hyJ8	รวมเพลงฮิต เพลงชิล ร้านกาแฟ [ฟังเพลิน,cafe,coffee]【LONGPLAY】	https://i.ytimg.com/vi/99ZICU_hyJ8/mqdefault.jpg	\N	60 Minutes Longplay	200	2026-05-29 02:37:48.623229
1343	14	AgicfTq7kDU	ดนตรีบรรเลงเพราะๆ เพลงฟังเพลินละมุนหู | Thai Pop Cafe BGM	https://i.ytimg.com/vi/AgicfTq7kDU/mqdefault.jpg	\N	GMM สบาย สบาย	1	2026-05-29 02:38:18.782133
1344	14	l8T_PP7io_c	ดนตรีบรรเลงผ่อนคลาย เพลงฟังสบายในมื้อเช้า | Breakfast & Bossa BGM	https://i.ytimg.com/vi/l8T_PP7io_c/mqdefault.jpg	\N	GMM สบาย สบาย	2	2026-05-29 02:38:18.78716
1345	14	YzlYvUcTo0U	มื้อเช้า.. ฟังพลงชิล | Bossa & Breakfast | Morning Playlist	https://i.ytimg.com/vi/YzlYvUcTo0U/mqdefault.jpg	\N	GMM สบาย สบาย	3	2026-05-29 02:38:18.791712
1346	14	PVDBM8S37D8	Good Mood Music | ฟังเพลงเก่า อารมณ์ดี [เพียงชายคนนี้ (ไม่ใช่ผู้วิเศษ),รักแท้มีแค่ครั้งเดียว]	https://i.ytimg.com/vi/PVDBM8S37D8/mqdefault.jpg	\N	GMM สบาย สบาย	4	2026-05-29 02:38:18.796388
1347	14	36dl7QyoWuU	[LONGPLAY] ดนตรีฮีลใจ ฟังง่ายสบายหู | Good Mood Music	https://i.ytimg.com/vi/36dl7QyoWuU/mqdefault.jpg	\N	GMM สบาย สบาย	5	2026-05-29 02:38:18.801047
1348	14	tAHwgKLTOLw	[LONGPLAY] เพลงสบายๆ ฟังตอนเช้า อารมณ์ชิล  | Lo-Fi Morning	https://i.ytimg.com/vi/tAHwgKLTOLw/mqdefault.jpg	\N	GMM สบาย สบาย	6	2026-05-29 02:38:18.805635
1349	14	S5sJqiq_OPM	ฟังเพลงอารมณ์ดีตอนเช้า | Lo-Fi Yoga Music [ฟ้าส่งฉันมา,วันหนึ่ง...ฉันจะทำเพื่อเธอ]	https://i.ytimg.com/vi/S5sJqiq_OPM/mqdefault.jpg	\N	GMM สบาย สบาย	7	2026-05-29 02:38:18.810074
1350	14	8y26QTbTvGg	Cozy Chill Music | ฟังเพลงอุ่นใจ ในหน้าหนาว [ดอกไม้ในหัวใจ,ใครสักคน,ไม่บอกได้ไหม]	https://i.ytimg.com/vi/8y26QTbTvGg/mqdefault.jpg	\N	GMM สบาย สบาย	8	2026-05-29 02:38:18.816521
1351	14	80WSBMiY8X0	เพลงฮีลใจ ฟังสบายคลายเศร้า	https://i.ytimg.com/vi/80WSBMiY8X0/mqdefault.jpg	\N	GMM สบาย สบาย	9	2026-05-29 02:38:18.821729
1352	14	_5jzU9gggaM	Good Mood Music | ฟังเพลงสบายใจ ในวันทำงาน [ถ้าในโลกนี้ไม่มี,ฟ้าส่งฉันมา,อย่าคิดเลย]	https://i.ytimg.com/vi/_5jzU9gggaM/mqdefault.jpg	\N	GMM สบาย สบาย	10	2026-05-29 02:38:18.826713
1353	14	6EZkwlCYfx0	𝐖𝐨𝐫𝐤 𝐌𝐮𝐬𝐢𝐜 | ฟังไปทำงานไป [เธอสวย,เธอเป็นแฟนฉันแล้ว,ขอเป็นตัวเลือก]	https://i.ytimg.com/vi/6EZkwlCYfx0/mqdefault.jpg	\N	GMM สบาย สบาย	11	2026-05-29 02:38:18.830793
1354	14	MfK34i20rvw	ดนตรีฟังชิลๆ ได้ฟีลตอนจิบกาแฟ | Coffee & Thai Jazz BGM Playlist	https://i.ytimg.com/vi/MfK34i20rvw/mqdefault.jpg	\N	GMM สบาย สบาย	12	2026-05-29 02:38:18.835172
1355	14	aWqSr905QOg	Good Mood Music | ฟังเพลงสบายใจ ในวันทำงาน [ทุ้มอยู่ในใจ,คิดถึงฉันไหมเวลาที่เธอ]	https://i.ytimg.com/vi/aWqSr905QOg/mqdefault.jpg	\N	GMM สบาย สบาย	13	2026-05-29 02:38:18.839613
1356	14	AZftUD8ajXQ	Good Mood Music | ฟังเพลงสบายใจ ในวันทำงาน [ไม่เห็นฝุ่น,วงกลม,สิ่งที่มันกำลังเกิด]	https://i.ytimg.com/vi/AZftUD8ajXQ/mqdefault.jpg	\N	GMM สบาย สบาย	14	2026-05-29 02:38:18.844023
1357	14	Y2txMtwBL-8	Healing Chill Music | ทำงานเหนื่อยนัก ก็พักฟังเพลง [ พิง,สลักจิต,ลม]	https://i.ytimg.com/vi/Y2txMtwBL-8/mqdefault.jpg	\N	GMM สบาย สบาย	15	2026-05-29 02:38:18.847963
1358	14	uWsh4xlzF8Q	#coffeemusic Booster | ฟังเพลงฮีลใจ สายกาแฟ [นี่แหละความรัก,จะรักให้ดีที่สุด,ยิ่งรู้จัก ยิ่งรักเธอ]	https://i.ytimg.com/vi/uWsh4xlzF8Q/mqdefault.jpg	\N	GMM สบาย สบาย	16	2026-05-29 02:38:18.852572
1359	14	orhPuAbwkio	เติมพลัง ฟังเพลงเพราะ ตอนทำงาน | Workday Playlist [ Your Ever,เอาไรว่ามา,รีบจัง]	https://i.ytimg.com/vi/orhPuAbwkio/mqdefault.jpg	\N	GMM สบาย สบาย	17	2026-05-29 02:38:18.857225
1360	14	wh2fUgEy__4	Music Chill Vibes | เพลงสบายใจ ฟังสบายหู [รักษาสิทธิ์,ให้รักเดินทางมาเจอกัน,ที่รักของใครสักคน]	https://i.ytimg.com/vi/wh2fUgEy__4/mqdefault.jpg	\N	GMM สบาย สบาย	18	2026-05-29 02:38:18.861651
1361	14	w2CXgMS6fuE	Healing Chill Music | ทำงานเหนื่อยนัก ก็พักฟังเพลง [รักเธอที่สุด,ดอกไม้ในใจเธอ,ฉันจะจำเธอแบบนี้]	https://i.ytimg.com/vi/w2CXgMS6fuE/mqdefault.jpg	\N	GMM สบาย สบาย	19	2026-05-29 02:38:18.866919
1362	14	3nnGIFvGahE	𝐖𝐨𝐫𝐤 𝐌𝐮𝐬𝐢𝐜 | ฟังไปทำงานไป [คนธรรมดา,อย่าคิดเลย,รักฉันเพราะอะไร]	https://i.ytimg.com/vi/3nnGIFvGahE/mqdefault.jpg	\N	GMM สบาย สบาย	20	2026-05-29 02:38:18.872043
1363	14	2-ADZQDF_nk	Cozy Chill Music | ฟังเพลงอุ่นใจ ในหน้าหนาว [คนของเธอ,พรุ่งนี้...ไม่สาย,เธอ...ผู้ไม่แพ้]	https://i.ytimg.com/vi/2-ADZQDF_nk/mqdefault.jpg	\N	GMM สบาย สบาย	21	2026-05-29 02:38:18.876823
1364	14	M3SVXl08N14	Music Chill Vibes | เพลงสบายใจ ฟังสบายหู [คนไม่เอาถ่าน,ดีแต่ปาก,4 นาที]	https://i.ytimg.com/vi/M3SVXl08N14/mqdefault.jpg	\N	GMM สบาย สบาย	22	2026-05-29 02:38:18.881915
1365	14	2s--1etKJYs	#roadtrip Music | ฟังเพลิน เดินทางไกล [ยิ่งรู้จัก ยิ่งรักเธอ,จนกว่าฟ้าจะมีเวลา,เธอเอาใจฉันไป]	https://i.ytimg.com/vi/2s--1etKJYs/mqdefault.jpg	\N	GMM สบาย สบาย	23	2026-05-29 02:38:18.886936
1366	14	zrVGghXTT_o	Healing #loungemusic | พักใจฟังเพลงเพราะ [คิดถึงเธอทุกที(ที่อยู่คนเดียว),อดใจไม่ไหว,พรุ่งนี้ ไม่สาย]	https://i.ytimg.com/vi/zrVGghXTT_o/mqdefault.jpg	\N	GMM สบาย สบาย	24	2026-05-29 02:38:18.891276
1367	14	69TF5YbolqY	Healing Chill Music | ทำงานเหนื่อยนัก ก็พักฟังเพลง [ทางกลับบ้าน,ห่วง,ใจฉันอยู่กับเธอ]	https://i.ytimg.com/vi/69TF5YbolqY/mqdefault.jpg	\N	GMM สบาย สบาย	25	2026-05-29 02:38:18.896019
1368	14	q4E-UKzbV98	ฟังเพลงชิล ตอนจิบชา | Tea Break Music [เธอยัง,Stay,หวังดีเสมอ]	https://i.ytimg.com/vi/q4E-UKzbV98/mqdefault.jpg	\N	GMM สบาย สบาย	26	2026-05-29 02:38:18.900514
1369	14	T978Xllm1_Q	Healing Chill Music | ทำงานเหนื่อยนัก ก็พักฟังเพลง [ภาพจำ,ซ่อนกลิ่น,องศาเดียว]	https://i.ytimg.com/vi/T978Xllm1_Q/mqdefault.jpg	\N	GMM สบาย สบาย	27	2026-05-29 02:38:18.905421
1370	14	ndP8s_5rpMc	Good Mood Music | ฟังเพลงสบายใจ ในวันทำงาน [แตกต่างเหมือนกัน,โดดเดี่ยวด้วยกัน,วุ่นวาย]	https://i.ytimg.com/vi/ndP8s_5rpMc/mqdefault.jpg	\N	GMM สบาย สบาย	28	2026-05-29 02:38:18.910027
1371	14	lA59MjHkLfk	Good Mood Music | ฟังเพลงสบายใจ ในวันทำงาน [หวังดีเสมอ,นาฬิกาตาย,เธอยัง]	https://i.ytimg.com/vi/lA59MjHkLfk/mqdefault.jpg	\N	GMM สบาย สบาย	29	2026-05-29 02:38:18.914654
1372	14	FhDcqwvYo6s	เติมพลัง ฟังเพลงเพราะ ตอนทำงาน | Workday Playlist [คนในฝัน,เข้าใจใช่ไหม,คือเธอ]	https://i.ytimg.com/vi/FhDcqwvYo6s/mqdefault.jpg	\N	GMM สบาย สบาย	30	2026-05-29 02:38:18.919056
1373	14	TJyb3oEmCyE	ฟังเพลงอารมณ์ดีตอนเช้า | Stretching & Exercise | Upbeat Yoga Music	https://i.ytimg.com/vi/TJyb3oEmCyE/mqdefault.jpg	\N	GMM สบาย สบาย	31	2026-05-29 02:38:18.923838
1374	14	bzByvo0Sefc	Good Mood Music | ฟังเพลงสบายใจ ในวันทำงาน [รักเธอหัวทิ่มบ่อ,Yours Ever,นิดหน่อย]	https://i.ytimg.com/vi/bzByvo0Sefc/mqdefault.jpg	\N	GMM สบาย สบาย	32	2026-05-29 02:38:18.928583
1375	14	Y-oajsTA8tU	𝐂𝐨𝐟𝐟𝐞𝐞 𝐌𝐮𝐬𝐢𝐜 | จิบกาแฟฟังเพลง [อย่าคิดเลย,รักษาสิทธิ์,ใจกลางความรู้สึกดีดี]	https://i.ytimg.com/vi/Y-oajsTA8tU/mqdefault.jpg	\N	GMM สบาย สบาย	33	2026-05-29 02:38:18.932856
1376	14	hFMzLEMnYaY	Feel Good Music | ฟังเพลงฟีลดี รับปีใหม่ [เหตุผลร้อยแปด,หยุดความคิดไม่ได้,อยากให้โลกแคบลง]	https://i.ytimg.com/vi/hFMzLEMnYaY/mqdefault.jpg	\N	GMM สบาย สบาย	34	2026-05-29 02:38:18.937941
1377	14	KKt46BCuQOw	Healing #loungemusic | พักใจฟังเพลงเพราะ [รักเธอคนเดียว,สักวันคงเจอ,ให้รักเดินทางมาเจอกัน]	https://i.ytimg.com/vi/KKt46BCuQOw/mqdefault.jpg	\N	GMM สบาย สบาย	35	2026-05-29 02:38:18.942205
1378	14	3EkMCRgGcF4	Good Mood Music | ฟังเพลงสบายใจ ในวันทำงาน [Yours Ever,แรงโน้มถ่วง]	https://i.ytimg.com/vi/3EkMCRgGcF4/mqdefault.jpg	\N	GMM สบาย สบาย	36	2026-05-29 02:38:18.94679
1379	14	ckj0F-vY8eM	Healing Chill Music | ทำงานเหนื่อยนัก ก็พักฟังเพลง [ต้องโทษดาว,ใจฉันเป็นของเธอ]	https://i.ytimg.com/vi/ckj0F-vY8eM/mqdefault.jpg	\N	GMM สบาย สบาย	37	2026-05-29 02:38:18.951463
1380	14	41-D6XfFb3A	Good Mood Music | ฟังเพลงสบายใจ ในวันทำงาน [เหตุผลร้อยแปด,อยากให้โลกแคบลง]	https://i.ytimg.com/vi/41-D6XfFb3A/mqdefault.jpg	\N	GMM สบาย สบาย	38	2026-05-29 02:38:18.955666
1381	14	5XMoAbhr8OE	𝐂𝐨𝐟𝐟𝐞𝐞 𝐌𝐮𝐬𝐢𝐜 | จิบกาแฟฟังเพลง [ไม่มีใครรู้,ชายคนหนึ่ง,เสียงของหัวใจ]	https://i.ytimg.com/vi/5XMoAbhr8OE/mqdefault.jpg	\N	GMM สบาย สบาย	39	2026-05-29 02:38:18.96008
1382	14	NmvElOACIgc	[LONGPLAY] เพลงชิล ฟังยามเช้า | Good Morning Music	https://i.ytimg.com/vi/NmvElOACIgc/mqdefault.jpg	\N	GMM สบาย สบาย	40	2026-05-29 02:38:18.964655
1383	14	3xx96imqn5U	Healing Chill Music | ทำงานเหนื่อยนัก ก็พักฟังเพลง [แค่คนอีกคน,คิดถึงฉันไหมเวลาที่เธอ]	https://i.ytimg.com/vi/3xx96imqn5U/mqdefault.jpg	\N	GMM สบาย สบาย	41	2026-05-29 02:38:18.969999
1384	14	akw9caR9FkE	Feel Good Music | ฟังเพลงชิล ฟีลสบายๆ [แปดโมงเช้าวันอังคาร,ฟ้าส่งฉันมา,อยากบอกว่ารัก]	https://i.ytimg.com/vi/akw9caR9FkE/mqdefault.jpg	\N	GMM สบาย สบาย	42	2026-05-29 02:38:18.974998
1385	14	c-TmREDjYkI	Cozy Chill Music | ฟังเพลงอุ่นใจ ในหน้าหนาว [สิ่งสำคัญ,ใจฉันเป็นของเธอ,ไม่แข่งยิ่งแพ้]	https://i.ytimg.com/vi/c-TmREDjYkI/mqdefault.jpg	\N	GMM สบาย สบาย	43	2026-05-29 02:38:18.979456
1386	14	HCyCOHmkAjU	Music Chill Vibes | เพลงสบายใจ ฟังสบายหู [เธอยัง,สิ่งสำคัญ,หวังดีเสมอ]	https://i.ytimg.com/vi/HCyCOHmkAjU/mqdefault.jpg	\N	GMM สบาย สบาย	44	2026-05-29 02:38:18.984257
1387	14	vdTmF2-moyw	𝐖𝐨𝐫𝐤 𝐌𝐮𝐬𝐢𝐜 | ฟังไปทำงานไป [ที่รักของใครสักคน,อย่าอยู่คนเดียว,หัวใจไม่อยู่กับตัว]	https://i.ytimg.com/vi/vdTmF2-moyw/mqdefault.jpg	\N	GMM สบาย สบาย	45	2026-05-29 02:38:18.988877
1388	14	j10wxdQF3Lc	Music Chill Vibes | เพลงสบายใจ ฟังสบายหู [หนึ่งคืน,ดึงดัน,เพลงผีเสื้อ]	https://i.ytimg.com/vi/j10wxdQF3Lc/mqdefault.jpg	\N	GMM สบาย สบาย	46	2026-05-29 02:38:18.99342
1389	14	t6o8MX-_HBg	Healing #loungemusic | พักใจฟังเพลงเพราะ [สักวันคงเจอ,ใครสักคน,ดอกไม้ในหัวใจ]	https://i.ytimg.com/vi/t6o8MX-_HBg/mqdefault.jpg	\N	GMM สบาย สบาย	47	2026-05-29 02:38:18.997751
1390	14	wLk6gjx7HBQ	Healing Chill Music | ทำงานเหนื่อยนัก ก็พักฟังเพลง [หากฉันรู้,ดอกไม้ในใจเธอ,ไม่บอกได้ไหม]	https://i.ytimg.com/vi/wLk6gjx7HBQ/mqdefault.jpg	\N	GMM สบาย สบาย	48	2026-05-29 02:38:19.002461
1391	14	N2SBDBPX5Ic	Feel Good Music | ฟังเพลงชิล ฟีลสบายๆ [เพลงรัก,น้ำหอม,ซ่อนเธอไว้ในเพลง]	https://i.ytimg.com/vi/N2SBDBPX5Ic/mqdefault.jpg	\N	GMM สบาย สบาย	49	2026-05-29 02:38:19.006746
1392	14	C66pU8fk5YE	Cozy Chill Music | ฟังเพลงอุ่นใจ ในหน้าหนาว [หนาว,ไออุ่นรัก,เพลงผีเสื้อ]	https://i.ytimg.com/vi/C66pU8fk5YE/mqdefault.jpg	\N	GMM สบาย สบาย	50	2026-05-29 02:38:19.011759
1393	14	shbnhtQ7-aI	Good Mood Music | ฟังเพลงสบายใจ ในวันทำงาน [คนธรรมดา,สิ่งที่มันกำลังเกิด,เปรี้ยวใจ]	https://i.ytimg.com/vi/shbnhtQ7-aI/mqdefault.jpg	\N	GMM สบาย สบาย	51	2026-05-29 02:38:19.01752
1394	14	khlastx66PE	Cozy Chill Music | ฟังเพลงอุ่นใจ ในหน้าหนาว [ทุ้มอยู่ในใจ,นางฟ้าในใจ,เพลงผีเสื้อ]	https://i.ytimg.com/vi/khlastx66PE/mqdefault.jpg	\N	GMM สบาย สบาย	52	2026-05-29 02:38:19.022291
1395	14	5UXRX0zFkm0	𝐂𝐨𝐟𝐟𝐞𝐞 𝐌𝐮𝐬𝐢𝐜 | จิบกาแฟฟังเพลง [อย่าคิดเลย,ถ้าในโลกนี้ไม่มี,ใจฉันเป็นของเธอ]	https://i.ytimg.com/vi/5UXRX0zFkm0/mqdefault.jpg	\N	GMM สบาย สบาย	53	2026-05-29 02:38:19.026253
1396	14	5MuDn-Ki5XA	𝐖𝐨𝐫𝐤 𝐌𝐮𝐬𝐢𝐜 | ฟังไปทำงานไป [เรื่องเล็กของเธอ,ยิ่งรู้จัก ยิ่งรักเธอ,จะรักให้ดีที่สุด]	https://i.ytimg.com/vi/5MuDn-Ki5XA/mqdefault.jpg	\N	GMM สบาย สบาย	54	2026-05-29 02:38:19.030272
1397	14	v1qPCn8tv7Q	ฟังเพลงอารมณ์ดีตอนเช้า | Positive Energy Music [คิดถึงฉันไหมเวลาที่เธอ,เธอคือดวงใจของฉัน]	https://i.ytimg.com/vi/v1qPCn8tv7Q/mqdefault.jpg	\N	GMM สบาย สบาย	55	2026-05-29 02:38:19.034423
1398	14	9GvsEGiOgys	Feel Good Music | ฟังเพลงชิล ฟีลสบายๆ [ซ่อนกลิ่น,ฝนตกที่หน้าต่าง,ดอกไม้กับหัวใจ]	https://i.ytimg.com/vi/9GvsEGiOgys/mqdefault.jpg	\N	GMM สบาย สบาย	56	2026-05-29 02:38:19.044891
1399	14	H90HjUnFFyc	Cozy Chill Music | ฟังเพลงอุ่นใจ ในหน้าหนาว [รับได้ทุกอย่าง,เธอยัง,คนไม่เอาถ่าน]	https://i.ytimg.com/vi/H90HjUnFFyc/mqdefault.jpg	\N	GMM สบาย สบาย	57	2026-05-29 02:38:19.049446
1400	14	aiqyQpVHyjE	Cozy Chill Music | ฟังเพลงอุ่นใจ ในหน้าหนาว [โปรดเถิดรัก,Aroma,กี่ฤดู]	https://i.ytimg.com/vi/aiqyQpVHyjE/mqdefault.jpg	\N	GMM สบาย สบาย	58	2026-05-29 02:38:19.054152
1401	14	taYSXICp-Vs	#coffeemusic Booster | ฟังเพลงฮีลใจ สายกาแฟ [สนิทใจ,ขวัญเอยขวัญมา,ฟัง]	https://i.ytimg.com/vi/taYSXICp-Vs/mqdefault.jpg	\N	GMM สบาย สบาย	59	2026-05-29 02:38:19.058358
1402	14	9ypj6L9jfyk	#drivingmusic | ฟังเพลิน เดินทางไกล [คิดถึงทุกเวลา,รักแล้วรักเลย,เจ้าสาวที่กลัวฝน]	https://i.ytimg.com/vi/9ypj6L9jfyk/mqdefault.jpg	\N	GMM สบาย สบาย	60	2026-05-29 02:38:19.064069
1403	14	J-3MBZyD_3w	Feel Good Music | ฟังเพลงฟีลดี รับปีใหม่ [นี่แหละความรัก,ไม่มีใครรู้,อยากให้โลกแคบลง]	https://i.ytimg.com/vi/J-3MBZyD_3w/mqdefault.jpg	\N	GMM สบาย สบาย	61	2026-05-29 02:38:19.068487
1404	14	_RleUAZhg4w	Healing Chill Music | ทำงานเหนื่อยนัก ก็พักฟังเพลง [เธอคือนางฟ้าในใจ,เพลงผีเสื้อ]	https://i.ytimg.com/vi/_RleUAZhg4w/mqdefault.jpg	\N	GMM สบาย สบาย	62	2026-05-29 02:38:19.073328
1405	14	fz39oyJnbxo	Feel Good Music | ฟังเพลงฟีลดี รับปีใหม่ [คืนข้ามปี,คิดถึงเธอทุกที(ที่อยู่คนเดียว),ขอให้เหมือนเดิม]	https://i.ytimg.com/vi/fz39oyJnbxo/mqdefault.jpg	\N	GMM สบาย สบาย	63	2026-05-29 02:38:19.077702
1406	14	FmZPiCwOzdc	#drivingmusic | ฟังเพลิน เดินทางไกล [เสียงกระซิบ,สบาย สบาย,คิดถึงทุกเวลา]	https://i.ytimg.com/vi/FmZPiCwOzdc/mqdefault.jpg	\N	GMM สบาย สบาย	64	2026-05-29 02:38:19.090201
1407	14	JHLhFk_4W80	Cozy Chill Music | ฟังเพลงอุ่นใจ ในหน้าหนาว [ใจสั่งมา,สัญญาต้องเป็นสัญญา,พรุ่งนี้ ไม่สาย]	https://i.ytimg.com/vi/JHLhFk_4W80/mqdefault.jpg	\N	GMM สบาย สบาย	65	2026-05-29 02:38:19.095124
1408	14	TUrKZFnghnI	Feel Good Music | ฟังเพลงชิล ฟีลสบายๆ [ไออุ่นรัก,เธอจะอยู่กับฉันตลอดไป,ปฏิเสธไม่ได้ว่ารักเธอ]	https://i.ytimg.com/vi/TUrKZFnghnI/mqdefault.jpg	\N	GMM สบาย สบาย	66	2026-05-29 02:38:19.099847
1409	14	kAHtAlKB6Rc	Feel Good Music | ฟังเพลงฟีลดี รับปีใหม่ [นี่แหละความรัก,ไม่มีใครรู้,อยากให้โลกแคบลง]	https://i.ytimg.com/vi/kAHtAlKB6Rc/mqdefault.jpg	\N	GMM สบาย สบาย	67	2026-05-29 02:38:19.106178
1410	14	_UgPX3llpyA	Feel Good Music | ฟังเพลงชิล ฟีลสบายๆ [รักษาสิทธิ์,ใครสักคน,ที่คิดถึง...เพราะรักเธอใช่ไหม]	https://i.ytimg.com/vi/_UgPX3llpyA/mqdefault.jpg	\N	GMM สบาย สบาย	68	2026-05-29 02:38:19.110665
1411	14	Y_hR0XJ80sE	Good Mood Music | ฟังเพลงสบายใจ ในวันทำงาน [Loop (ฉันจึงวนกลับมา),จดจำ,ได้แต่นึกถึง]	https://i.ytimg.com/vi/Y_hR0XJ80sE/mqdefault.jpg	\N	GMM สบาย สบาย	69	2026-05-29 02:38:19.115896
1412	14	VRxT6v1cvrY	Lo Fi Study Vibes | เพลงเก่าซึ้ง คิดถึงวัยเรียน [ถ้าเธอหลายใจ,เรื่องเล็กของเธอ]	https://i.ytimg.com/vi/VRxT6v1cvrY/mqdefault.jpg	\N	GMM สบาย สบาย	70	2026-05-29 02:38:19.120434
1413	14	zfO992pTE2A	ฟังเพลงอารมณ์ดีตอนเช้า | Stretch Music Playlist [คำตอบของหัวใจ,ไออุ่นรัก,ไออุ่นรัก]	https://i.ytimg.com/vi/zfO992pTE2A/mqdefault.jpg	\N	GMM สบาย สบาย	71	2026-05-29 02:38:19.125547
1414	14	RCRe3v91HiQ	𝐖𝐨𝐫𝐤 𝐌𝐮𝐬𝐢𝐜 | ฟังไปทำงานไป [ทำไมต้องรักเธอ,คำถาม,ริบบิ้นเลิฟคัลเลอร์แบล็ค]	https://i.ytimg.com/vi/RCRe3v91HiQ/mqdefault.jpg	\N	GMM สบาย สบาย	72	2026-05-29 02:38:19.129643
1415	14	18e-bkBDhgI	#roadtrip Music | ฟังเพลิน เดินทางไกล [sexy,เรื่องมหัศจรรย์,ฝันไป...หรือเปล่า]	https://i.ytimg.com/vi/18e-bkBDhgI/mqdefault.jpg	\N	GMM สบาย สบาย	73	2026-05-29 02:38:19.134477
1416	14	Lr3C5p4ZgYQ	Cozy Chill Music | ฟังเพลงอุ่นใจ ในหน้าหนาว [รักแท้,รักแรก,ทุกความทรงจำ]	https://i.ytimg.com/vi/Lr3C5p4ZgYQ/mqdefault.jpg	\N	GMM สบาย สบาย	74	2026-05-29 02:38:19.139219
1417	14	u3Gl9x0Vdek	Feel Good Music | ฟังเพลงชิล ฟีลสบายๆ [เธอจะอยู่กับฉันตลอดไป,ปฏิเสธไม่ได้ว่ารักเธอ]	https://i.ytimg.com/vi/u3Gl9x0Vdek/mqdefault.jpg	\N	GMM สบาย สบาย	75	2026-05-29 02:38:19.143804
1418	14	oZ6NpyZMIgo	𝐂𝐨𝐟𝐟𝐞𝐞 𝐌𝐮𝐬𝐢𝐜 | จิบกาแฟฟังเพลง [ถ้าเธอหลายใจ,รักษาสิทธิ์,ไม่บอกได้ไหม]	https://i.ytimg.com/vi/oZ6NpyZMIgo/mqdefault.jpg	\N	GMM สบาย สบาย	76	2026-05-29 02:38:19.148234
1419	14	JEL_uOTtiYA	Healing Chill Music | ทำงานเหนื่อยนัก ก็พักฟังเพลง [สักวันคงเจอ,ทุ้มอยู่ในใจ,หนังสือรุ่น]	https://i.ytimg.com/vi/JEL_uOTtiYA/mqdefault.jpg	\N	GMM สบาย สบาย	77	2026-05-29 02:38:19.15314
1420	14	HfhR8H5q4DI	เติมพลัง ฟังเพลงเพราะ ตอนทำงาน | Workday Playlist [ไม่มีใครรู้,หยุดความคิดไม่ได้]	https://i.ytimg.com/vi/HfhR8H5q4DI/mqdefault.jpg	\N	GMM สบาย สบาย	78	2026-05-29 02:38:19.157891
1421	14	YCuIpaSBTrQ	เติมพลัง ฟังเพลงเพราะ ตอนทำงาน | Workday Playlist [SOMEONE,ไม่บอกได้ไหม,sassy girl]	https://i.ytimg.com/vi/YCuIpaSBTrQ/mqdefault.jpg	\N	GMM สบาย สบาย	79	2026-05-29 02:38:19.163188
1422	14	TFzvyQvJcUY	Feel Good Music | ฟังเพลงฟีลดี รับปีใหม่ [North Star,คำถาม,sexy]	https://i.ytimg.com/vi/TFzvyQvJcUY/mqdefault.jpg	\N	GMM สบาย สบาย	80	2026-05-29 02:38:19.168003
1423	14	0OSzlY4e_88	Cozy Chill Music | ฟังเพลงอุ่นใจ ในหน้าหนาว [SOMEONE,เผลอรักหมดใจ,เหงา]	https://i.ytimg.com/vi/0OSzlY4e_88/mqdefault.jpg	\N	GMM สบาย สบาย	81	2026-05-29 02:38:19.172626
1424	14	PnuUkM9AiyA	ฟังเพลงอารมณ์ดีตอนเช้า | LOFI BEATS | Stretching & Exercise [Stay,สิ่งสำคัญ,ชัดเจน]	https://i.ytimg.com/vi/PnuUkM9AiyA/mqdefault.jpg	\N	GMM สบาย สบาย	82	2026-05-29 02:38:19.176679
1425	14	ljsSJdotk0s	𝐖𝐨𝐫𝐤 𝐌𝐮𝐬𝐢𝐜 | ฟังไปทำงานไป [ฟ้าส่งฉันมา,หวังดีเสมอ,เธอยัง]	https://i.ytimg.com/vi/ljsSJdotk0s/mqdefault.jpg	\N	GMM สบาย สบาย	83	2026-05-29 02:38:19.181127
1426	14	hH7TirueKIw	Feel Good Music | ฟังเพลงชิล ฟีลสบายๆ [PLEASE,สลักจิต,จากคนรักเก่า]	https://i.ytimg.com/vi/hH7TirueKIw/mqdefault.jpg	\N	GMM สบาย สบาย	84	2026-05-29 02:38:19.185631
1427	14	X55f_UcDuno	Healing #loungemusic | พักใจฟังเพลงเพราะ [คำตอบของหัวใจ,หมดชีวิต(ฉันให้เธอ),อย่าอยู่คนเดียว]	https://i.ytimg.com/vi/X55f_UcDuno/mqdefault.jpg	\N	GMM สบาย สบาย	85	2026-05-29 02:38:19.189793
1428	14	LiM5RZLwK4g	Cozy Chill Music | ฟังเพลงอุ่นใจ ในหน้าหนาว [พรุ่งนี้...ไม่สาย,เสียงของหัวใจ,ขอใครสักคน]	https://i.ytimg.com/vi/LiM5RZLwK4g/mqdefault.jpg	\N	GMM สบาย สบาย	86	2026-05-29 02:38:19.193984
1429	14	eZp9MwoEm7o	Feel Good Music | ฟังเพลงชิล ฟีลสบายๆ [จนกว่าฟ้าจะมีเวลา,ทะเลาะ,หากตอนนี้เธอยังไม่เกิด]	https://i.ytimg.com/vi/eZp9MwoEm7o/mqdefault.jpg	\N	GMM สบาย สบาย	87	2026-05-29 02:38:19.198438
1430	14	7H0n0e633Hg	Good Mood Music | ฟังเพลงสบายใจ ในวันทำงาน [รักเธอหัวทิ่มบ่อ,วุ่นวาย,รักษาสิทธิ์]	https://i.ytimg.com/vi/7H0n0e633Hg/mqdefault.jpg	\N	GMM สบาย สบาย	88	2026-05-29 02:38:19.202544
1431	14	hY-xzpdUHIU	ฟังเพลงอารมณ์ดีตอนเช้า | Positive Energy Music [เธอจะอยู่กับฉันตลอดไป,คิดถึงฉันไหมเวลาที่เธอ]	https://i.ytimg.com/vi/hY-xzpdUHIU/mqdefault.jpg	\N	GMM สบาย สบาย	89	2026-05-29 02:38:19.207387
1432	14	56tVayDcLAo	#เพลงบรรเลงเพราะๆ รวมเพลงรัก ฟังคลายร้อน | Summer Chill Music #รวมเพลงน่ารัก	https://i.ytimg.com/vi/56tVayDcLAo/mqdefault.jpg	\N	GMM สบาย สบาย	90	2026-05-29 02:38:19.211789
1433	14	cbsl9Mk8CUM	Healing Chill Music | ทำงานเหนื่อยนัก ก็พักฟังเพลง [คนไม่เอาถ่าน,ความรักทำให้คนตาบอด,ขอเป็นตัวเลือก]	https://i.ytimg.com/vi/cbsl9Mk8CUM/mqdefault.jpg	\N	GMM สบาย สบาย	91	2026-05-29 02:38:19.21642
1434	14	YLAEeQP0DLA	Feel Good Music | ฟังเพลงฟีลดี รับปีใหม่ [ยิ่งรู้จัก ยิ่งรักเธอ,YOU YOU YOU,ปากว่าง]	https://i.ytimg.com/vi/YLAEeQP0DLA/mqdefault.jpg	\N	GMM สบาย สบาย	92	2026-05-29 02:38:19.220668
1435	14	UC96NwZmAe0	𝐂𝐨𝐟𝐟𝐞𝐞 𝐌𝐮𝐬𝐢𝐜 | จิบกาแฟฟังเพลง [ฟ้าส่งฉันมา,ทะเลาะ,แค่อยากจะบอก]	https://i.ytimg.com/vi/UC96NwZmAe0/mqdefault.jpg	\N	GMM สบาย สบาย	93	2026-05-29 02:38:19.22503
1436	14	NfKLZ10PLFg	#roadtrip music | ฟังเพลิน เดินทางไกล [หมอกหรือควัน,สบาย สบาย,รักหนักแน่น]	https://i.ytimg.com/vi/NfKLZ10PLFg/mqdefault.jpg	\N	GMM สบาย สบาย	94	2026-05-29 02:38:19.229104
1437	14	n0yS2Lx2VYg	Feel Good Music | ฟังเพลงฟีลดี รับปีใหม่ [แทนคำนั้น,เสียงกระซิบ,รักแล้วรักเลย]	https://i.ytimg.com/vi/n0yS2Lx2VYg/mqdefault.jpg	\N	GMM สบาย สบาย	95	2026-05-29 02:38:19.233231
1438	14	XlOQd0ipm40	Feel Good Music | ฟังเพลงฟีลดี รับปีใหม่ [SOMEONE,เผลอรักหมดใจ,I Need Somebody (อยากขอสักคน)]	https://i.ytimg.com/vi/XlOQd0ipm40/mqdefault.jpg	\N	GMM สบาย สบาย	96	2026-05-29 02:38:19.237627
1439	14	YxT8p1lHFIk	𝐂𝐨𝐟𝐟𝐞𝐞 𝐌𝐮𝐬𝐢𝐜 | จิบกาแฟฟังเพลง [อยากบอกว่ารัก,เธอคือเหตุผล,แค่อยากจะบอก]	https://i.ytimg.com/vi/YxT8p1lHFIk/mqdefault.jpg	\N	GMM สบาย สบาย	97	2026-05-29 02:38:19.242647
1440	14	LQ73LSGM4eU	𝐖𝐨𝐫𝐤 𝐌𝐮𝐬𝐢𝐜 | ฟังไปทำงานไป [ไม่มีใครรู้,ปากว่าง,เรื่องเล็กของเธอ]	https://i.ytimg.com/vi/LQ73LSGM4eU/mqdefault.jpg	\N	GMM สบาย สบาย	98	2026-05-29 02:38:19.247533
1441	14	rre44-piul0	Music Chill Vibes | เพลงสบายใจ ฟังสบายหู [ไม่ต้องรู้ว่าเราคบกันแบบไหน,รักเดียวใจเดียว]	https://i.ytimg.com/vi/rre44-piul0/mqdefault.jpg	\N	GMM สบาย สบาย	99	2026-05-29 02:38:19.260299
1442	14	MZZtLRxVPx0	Healing #loungemusic | พักใจฟังเพลงเพราะ [ชายคนหนึ่ง,มากกว่ารัก,ปลายสายรุ้ง]	https://i.ytimg.com/vi/MZZtLRxVPx0/mqdefault.jpg	\N	GMM สบาย สบาย	100	2026-05-29 02:38:19.268129
1443	14	S2SXUpHOhC8	เติมพลัง ฟังเพลงเพราะ ตอนทำงาน | Workday Playlist [คนไม่เอาถ่าน,ขอเป็นคนของเธอ,เธอคือเหตุผล]	https://i.ytimg.com/vi/S2SXUpHOhC8/mqdefault.jpg	\N	GMM สบาย สบาย	101	2026-05-29 02:38:19.280444
1444	14	iuJGTNOMX1Y	ฟังเพลงอารมณ์ดีตอนเช้า | Positive Energy Music [เผลอรักหมดใจ,SOMEONE,I Need Somebody (อยากขอสักคน)]	https://i.ytimg.com/vi/iuJGTNOMX1Y/mqdefault.jpg	\N	GMM สบาย สบาย	102	2026-05-29 02:38:19.285322
1445	14	TStsB148-zo	Music Chill Vibes | เพลงสบายใจ ฟังสบายหู [คิด(แต่ไม่)ถึง,PLEASE,ด้วยความคิดถึง]	https://i.ytimg.com/vi/TStsB148-zo/mqdefault.jpg	\N	GMM สบาย สบาย	103	2026-05-29 02:38:19.290154
1446	14	-3-7HYgX0GY	ฟังเพลงอารมณ์ดีตอนเช้า | Stretch Music Playlist [ใครสักคน,ดอกไม้ในใจเธอ,เพลงผีเสื้อ]	https://i.ytimg.com/vi/-3-7HYgX0GY/mqdefault.jpg	\N	GMM สบาย สบาย	104	2026-05-29 02:38:19.29437
1447	14	ZU5WsIWf4kE	#coffeemusic Booster | ฟังเพลงฮีลใจ สายกาแฟ [Sassy Girl,Will you marry me ?]	https://i.ytimg.com/vi/ZU5WsIWf4kE/mqdefault.jpg	\N	GMM สบาย สบาย	105	2026-05-29 02:38:19.298552
1448	14	ksbyRshwZB8	#coffeemusic Booster | ฟังเพลงฮีลใจ สายกาแฟ [เราคงต้องเป็นแฟนกัน,รักหนักแน่น]	https://i.ytimg.com/vi/ksbyRshwZB8/mqdefault.jpg	\N	GMM สบาย สบาย	106	2026-05-29 02:38:19.304111
1449	14	yKyNIFpNks4	Healing #loungemusic | พักใจฟังเพลงเพราะ [คำตอบของหัวใจ,ดอกไม้ในใจเธอ,คือเธอ]	https://i.ytimg.com/vi/yKyNIFpNks4/mqdefault.jpg	\N	GMM สบาย สบาย	107	2026-05-29 02:38:19.309115
1450	14	tCJsWPSol9w	𝐂𝐨𝐟𝐟𝐞𝐞 𝐌𝐮𝐬𝐢𝐜 | จิบกาแฟฟังเพลง [ซ่อนกลิ่น,ขวัญเอย ขวัญมา,ฟ้าส่งฉันมา]	https://i.ytimg.com/vi/tCJsWPSol9w/mqdefault.jpg	\N	GMM สบาย สบาย	108	2026-05-29 02:38:19.314129
1451	14	fD6P4NzwMak	Good Mood Music | ฟังเพลงเก่า90's อารมณ์ดี [ฝนตกที่หน้าต่าง,ไม่ต้องห่วงฉัน,เจ้าสาวที่กลัวฝน]	https://i.ytimg.com/vi/fD6P4NzwMak/mqdefault.jpg	\N	GMM สบาย สบาย	109	2026-05-29 02:38:19.31877
1452	14	0n2dyv6DREo	ฟังเพลงชิล ตอนจิบชา | Tea Break Music [เข้าใจใช่ไหม,แสนล้านนาที,ยังจำกันได้ไหม]	https://i.ytimg.com/vi/0n2dyv6DREo/mqdefault.jpg	\N	GMM สบาย สบาย	110	2026-05-29 02:38:19.324163
1453	14	HKpy22hM3do	Healing #loungemusic | พักใจฟังเพลงเพราะ [เพลงรัก,นอนไม่หลับ,เข้าใจใช่ไหม]	https://i.ytimg.com/vi/HKpy22hM3do/mqdefault.jpg	\N	GMM สบาย สบาย	111	2026-05-29 02:38:19.329185
1454	14	CSFwJwfbSMg	[LONGPLAY] เพลงร้านกาแฟ ดนตรีฟังเพลิน 3 ชั่วโมง #ฟังเพลงยาวๆ #ไม่มีโฆษณา	https://i.ytimg.com/vi/CSFwJwfbSMg/mqdefault.jpg	\N	GMM สบาย สบาย	112	2026-05-29 02:38:19.334523
1455	14	4EjzRojUU14	Feel Good Music | ฟังเพลงชิล ฟีลสบายๆ [รักหนักแน่น,เหตุผลร้อยแปด,อยากให้โลกแคบลง]	https://i.ytimg.com/vi/4EjzRojUU14/mqdefault.jpg	\N	GMM สบาย สบาย	113	2026-05-29 02:38:19.339603
1456	14	RWJtdXvKr54	เติมพลัง ฟังเพลงเพราะ ตอนทำงาน | Workday Playlist [เราคงต้องเป็นแฟนกัน,อย่าบอกให้ใครรู้]	https://i.ytimg.com/vi/RWJtdXvKr54/mqdefault.jpg	\N	GMM สบาย สบาย	114	2026-05-29 02:38:19.345247
1457	14	FNpsu8QFqMc	Music Chill Vibes | เพลงสบายใจ ฟังสบายหู [Yours Ever,วุ่นวาย]	https://i.ytimg.com/vi/FNpsu8QFqMc/mqdefault.jpg	\N	GMM สบาย สบาย	115	2026-05-29 02:38:19.34967
1458	14	Npe6QN6F6dU	Healing Chill Music | ทำงานเหนื่อยนัก ก็พักฟังเพลง [ฉันไม่มีเวทมนต์,สัญญาต้องเป็นสัญญา]	https://i.ytimg.com/vi/Npe6QN6F6dU/mqdefault.jpg	\N	GMM สบาย สบาย	116	2026-05-29 02:38:19.35486
1459	14	GlelJs2dEgI	Feel Good Music | ฟังเพลงชิล ฟีลสบายๆ [ฟ้ากับตะวัน,ฟ้าส่งฉันมา,ปลิว]	https://i.ytimg.com/vi/GlelJs2dEgI/mqdefault.jpg	\N	GMM สบาย สบาย	117	2026-05-29 02:38:19.359289
1460	14	YnrG_SvIIkM	Cozy Chill Music | ฟังเพลงอุ่นใจ ในหน้าหนาว [ดอกไม้ในหัวใจ,ใครสักคน,ไม่บอกได้ไหม]	https://i.ytimg.com/vi/YnrG_SvIIkM/mqdefault.jpg	\N	GMM สบาย สบาย	118	2026-05-29 02:38:19.364068
1461	14	auKL9NxsXkQ	#roadtrip Music | ฟังเพลิน เดินทางไกล [เนื้อคู่,ใจบอกว่าใช่,คนธรรมดา]	https://i.ytimg.com/vi/auKL9NxsXkQ/mqdefault.jpg	\N	GMM สบาย สบาย	119	2026-05-29 02:38:19.368412
1462	14	IeszQW2aBqc	เติมพลัง ฟังเพลงเพราะ ตอนทำงาน | Workday Playlist [หยุดความคิดไม่ได้,อยากให้โลกแคบลง,นี่แหละความรัก]	https://i.ytimg.com/vi/IeszQW2aBqc/mqdefault.jpg	\N	GMM สบาย สบาย	120	2026-05-29 02:38:19.372898
1463	14	an7PtooEqKQ	Cozy Chill Music | ฟังเพลงอุ่นใจ ในหน้าหนาว [หลับตา,คนไม่มีวาสนา,ไม่ต้องห่วงฉัน]	https://i.ytimg.com/vi/an7PtooEqKQ/mqdefault.jpg	\N	GMM สบาย สบาย	121	2026-05-29 02:38:19.377276
1464	14	WYP0kzWoTP8	#roadtrip Music | ฟังเพลิน เดินทางไกล [North Star,รักษาสิทธิ์,คนธรรมดา]	https://i.ytimg.com/vi/WYP0kzWoTP8/mqdefault.jpg	\N	GMM สบาย สบาย	122	2026-05-29 02:38:19.381436
1465	14	MEKP183IEvc	ฟังเพลงอารมณ์ดีตอนเช้า | Stretch Music Playlist [คนไม่เอาถ่าน,เธอคือนางฟ้าในใจ,พูดในใจ]	https://i.ytimg.com/vi/MEKP183IEvc/mqdefault.jpg	\N	GMM สบาย สบาย	123	2026-05-29 02:38:19.385538
1466	14	ZoWtxjG7vxE	Good Mood Music | ฟังเพลงสบายใจ ในวันทำงาน [4 นาที,ไม่เห็นฝุ่น,ชู้ในใจ]	https://i.ytimg.com/vi/ZoWtxjG7vxE/mqdefault.jpg	\N	GMM สบาย สบาย	124	2026-05-29 02:38:19.389701
1467	14	rSsL2WjJINk	Good Mood Music | ฟังเพลงเก่ายุค90 อารมณ์ดี [เสียดาย,คนสุดท้าย,เก็บมันเอาไว้]	https://i.ytimg.com/vi/rSsL2WjJINk/mqdefault.jpg	\N	GMM สบาย สบาย	125	2026-05-29 02:38:19.393995
1468	14	jwAG6DuQQFY	ดนตรีเพราะๆ ฟังสบายๆ | Thai Pop 90’s 2000’s Music #เพลงไทย #ฟังเพลงออนไลน์	https://i.ytimg.com/vi/jwAG6DuQQFY/mqdefault.jpg	\N	GMM สบาย สบาย	126	2026-05-29 02:38:19.398635
1469	14	78k6DSZdyV8	#drivingmusic | ฟังเพลิน เดินทางไกล [ปากว่าง,จะรักให้ดีที่สุด,เรื่องเล็กของเธอ]	https://i.ytimg.com/vi/78k6DSZdyV8/mqdefault.jpg	\N	GMM สบาย สบาย	127	2026-05-29 02:38:19.40322
1470	14	6D7W24JswVU	#coffeemusic Booster | ฟังเพลงฮีลใจ สายกาแฟ [รักหนักแน่น,คนไม่มีแฟน,สองเราเท่ากัน]	https://i.ytimg.com/vi/6D7W24JswVU/mqdefault.jpg	\N	GMM สบาย สบาย	128	2026-05-29 02:38:19.407776
1471	14	f56nQcCKabM	Feel Good Music | ฟังเพลงฟีลดี รับปีใหม่ [ขอ,รักษาสิทธิ์,ถ้าในโลกนี้ไม่มี]	https://i.ytimg.com/vi/f56nQcCKabM/mqdefault.jpg	\N	GMM สบาย สบาย	129	2026-05-29 02:38:19.41255
1472	14	O2BMfsoU2FA	#roadtrip Music | ฟังเพลิน เดินทางไกล [จนกว่าฟ้าจะมีเวลา,คนธรรมดา,เนื้อคู่]	https://i.ytimg.com/vi/O2BMfsoU2FA/mqdefault.jpg	\N	GMM สบาย สบาย	130	2026-05-29 02:38:19.416719
1473	14	L_4wnevB6Rw	#coffeemusic Booster | ฟังเพลงฮีลใจ สายกาแฟ [อยากให้โลกแคบลง,คนธรรมดา,หยุดความคิดไม่ได้]	https://i.ytimg.com/vi/L_4wnevB6Rw/mqdefault.jpg	\N	GMM สบาย สบาย	131	2026-05-29 02:38:19.420942
1474	14	GcdkQlTfEGI	ฟังเพลงชิล ตอนจิบชา | Tea Break Music [เธอคือนางฟ้าในใจ,เพลงผีเสื้อ,ไออุ่นรัก]	https://i.ytimg.com/vi/GcdkQlTfEGI/mqdefault.jpg	\N	GMM สบาย สบาย	132	2026-05-29 02:38:19.426283
1475	14	TN_hKSFFKf8	#drivingmusic | ฟังเพลิน เดินทางไกล [บรรยากาศ,ขวัญเอยขวัญมา,ทุกวันพรุ่งนี้]	https://i.ytimg.com/vi/TN_hKSFFKf8/mqdefault.jpg	\N	GMM สบาย สบาย	133	2026-05-29 02:38:19.430441
1476	14	07ugUYNW_PE	Feel Good Music | ฟังเพลงฟีลดี รับปีใหม่ [สองเราเท่ากัน,เสียดาย,รักเป็นเช่นใด]	https://i.ytimg.com/vi/07ugUYNW_PE/mqdefault.jpg	\N	GMM สบาย สบาย	134	2026-05-29 02:38:19.435374
1477	14	mlL0lh2yObg	Healing #loungemusic | พักใจฟังเพลงเพราะ [ไม่ต้องรู้ว่าเราคบกันแบบไหน,แค่อยากจะบอก,เธอคือเหตุผล]	https://i.ytimg.com/vi/mlL0lh2yObg/mqdefault.jpg	\N	GMM สบาย สบาย	135	2026-05-29 02:38:19.43973
1478	14	UUw4Y8Re39w	𝐖𝐨𝐫𝐤 𝐌𝐮𝐬𝐢𝐜 | ฟังไปทำงานไป [กลับมาเพื่อบอกลา,ความว่างเปล่า,แผลเป็น]	https://i.ytimg.com/vi/UUw4Y8Re39w/mqdefault.jpg	\N	GMM สบาย สบาย	136	2026-05-29 02:38:19.444602
1479	14	KFY-6M-xZjM	#roadtrip Music | ฟังเพลิน เดินทางไกล [ริบบิ้นเลิฟคัลเลอร์แบล็ค,R U OK?,จากกันด้วยดี]	https://i.ytimg.com/vi/KFY-6M-xZjM/mqdefault.jpg	\N	GMM สบาย สบาย	137	2026-05-29 02:38:19.44861
1480	14	yW3xJAfyQ84	Good Mood Music | ฟังเพลงสบายใจ ในวันทำงาน [ได้แต่นึกถึง,เผื่อว่าจะพบเธอสักวัน,ซ่อนเธอไว้ในเพลง]	https://i.ytimg.com/vi/yW3xJAfyQ84/mqdefault.jpg	\N	GMM สบาย สบาย	138	2026-05-29 02:38:19.453212
1481	14	QSBd7KspI0k	𝐂𝐨𝐟𝐟𝐞𝐞 𝐌𝐮𝐬𝐢𝐜 | จิบกาแฟฟังเพลง [คิดถึงทุกเวลา,แทนคำนั้น,แพ้ใจ]	https://i.ytimg.com/vi/QSBd7KspI0k/mqdefault.jpg	\N	GMM สบาย สบาย	139	2026-05-29 02:38:19.457714
1482	14	LMbTHdvf7_w	𝐖𝐨𝐫𝐤 𝐌𝐮𝐬𝐢𝐜 | ฟังไปทำงานไป [ซ่อนกลิ่น,สนิทใจ,ทุกวันพรุ่งนี้ (Along The Way)]	https://i.ytimg.com/vi/LMbTHdvf7_w/mqdefault.jpg	\N	GMM สบาย สบาย	140	2026-05-29 02:38:19.46214
1483	14	VPdKhoHiOZw	Good Mood Music | ฟังเพลงเก่า 90-2000's อารมณ์ดี [อารมณ์ดี,North Star,รักษาสิทธิ์]	https://i.ytimg.com/vi/VPdKhoHiOZw/mqdefault.jpg	\N	GMM สบาย สบาย	141	2026-05-29 02:38:19.466401
1547	15	MmXp_cSLxMc	Bomb at Track - หลุมในใจ (Official Video)	https://i.ytimg.com/vi/MmXp_cSLxMc/mqdefault.jpg	\N	BOMB AT TRACK	5	2026-05-30 04:08:34.963318
1484	14	hCwcsrMd8O0	𝐂𝐨𝐟𝐟𝐞𝐞 𝐌𝐮𝐬𝐢𝐜 | จิบกาแฟฟังเพลง [ดาว,ฝันไป...หรือเปล่า,sexy]	https://i.ytimg.com/vi/hCwcsrMd8O0/mqdefault.jpg	\N	GMM สบาย สบาย	142	2026-05-29 02:38:19.470346
1485	14	DFUzqUHYUsI	Good Mood Music | ฟังเพลงสบายใจ ในวันทำงาน [แปดโมงเช้าวันอังคาร,ฟ้าส่งฉันมา,อยากบอกว่ารัก]	https://i.ytimg.com/vi/DFUzqUHYUsI/mqdefault.jpg	\N	GMM สบาย สบาย	143	2026-05-29 02:38:19.474343
1486	14	JgLgQshPjnM	𝐂𝐨𝐟𝐟𝐞𝐞 𝐌𝐮𝐬𝐢𝐜 | จิบกาแฟฟังเพลง [SOMEONE,เผลอรักหมดใจ,ยังจำกันได้ไหม]	https://i.ytimg.com/vi/JgLgQshPjnM/mqdefault.jpg	\N	GMM สบาย สบาย	144	2026-05-29 02:38:19.478737
1487	14	CaAGGnTzWf4	𝐖𝐨𝐫𝐤 𝐌𝐮𝐬𝐢𝐜 | ฟังไปทำงานไป [นอนไม่หลับ,เข้าใจใช่ไหม,Stay]	https://i.ytimg.com/vi/CaAGGnTzWf4/mqdefault.jpg	\N	GMM สบาย สบาย	145	2026-05-29 02:38:19.483387
1488	14	MZ5jq0XUQE4	#drivingmusic | ฟังเพลิน เดินทางไกล [อารมณ์ดี,ทอฝัน,รักษาสิทธิ์]	https://i.ytimg.com/vi/MZ5jq0XUQE4/mqdefault.jpg	\N	GMM สบาย สบาย	146	2026-05-29 02:38:19.487539
1489	14	Tg6Ai3yVASg	ฟังเพลงอารมณ์ดีตอนเช้า | Positive Energy Music [ดอกไม้ในใจเธอ,รักเธอที่สุด,พรุ่งนี้อาจไม่มีฉัน]	https://i.ytimg.com/vi/Tg6Ai3yVASg/mqdefault.jpg	\N	GMM สบาย สบาย	147	2026-05-29 02:38:19.492714
1490	14	YEto5GDDrkY	เติมพลัง ฟังเพลงเพราะ ตอนทำงาน | Workday Playlist [นี่แหละความรัก,หยุดความคิดไม่ได้]	https://i.ytimg.com/vi/YEto5GDDrkY/mqdefault.jpg	\N	GMM สบาย สบาย	148	2026-05-29 02:38:19.497526
1491	14	tylTTOyUTa0	เติมพลัง ฟังเพลงเพราะ ตอนทำงาน | Workday Playlist [รักแล้วรักเลย,เสียดาย,ทอฝัน]	https://i.ytimg.com/vi/tylTTOyUTa0/mqdefault.jpg	\N	GMM สบาย สบาย	149	2026-05-29 02:38:19.502366
1492	14	RayFYE8hx4M	เพลงบรรเลงผ่อนคลาย ฟังยามบ่ายสบายใจ | Afternoon & Jazz BGM	https://i.ytimg.com/vi/RayFYE8hx4M/mqdefault.jpg	\N	GMM สบาย สบาย	150	2026-05-29 02:38:19.506983
1493	14	6cmYQdOfk-Q	𝐂𝐨𝐟𝐟𝐞𝐞 𝐌𝐮𝐬𝐢𝐜 | จิบกาแฟฟังเพลง [รักษาสิทธิ์,ให้รักเดินทางมาเจอกัน,ชัดเจน]	https://i.ytimg.com/vi/6cmYQdOfk-Q/mqdefault.jpg	\N	GMM สบาย สบาย	151	2026-05-29 02:38:19.512226
1494	14	OPGcyiPeOYw	Feel Good Music | ฟังเพลงชิล ฟีลสบายๆ [เท่าไหร่ไม่จำ,อารมณ์สีเทา,หมอนสองใบกับใจเหงาๆ]	https://i.ytimg.com/vi/OPGcyiPeOYw/mqdefault.jpg	\N	GMM สบาย สบาย	152	2026-05-29 02:38:19.516841
1495	14	PB5gIgM0Jqk	Healing #loungemusic | พักใจฟังเพลงเพราะ [ภาพจำ,อย่าไปไหนอีกนะ,Stay]	https://i.ytimg.com/vi/PB5gIgM0Jqk/mqdefault.jpg	\N	GMM สบาย สบาย	153	2026-05-29 02:38:19.521355
1496	14	RBFnmU_RjSk	Music Chill Vibes | เพลงสบายใจ ฟังสบายหู [เพลงรัก,น้ำหอม,ซ่อนเธอไว้ในเพลง]	https://i.ytimg.com/vi/RBFnmU_RjSk/mqdefault.jpg	\N	GMM สบาย สบาย	154	2026-05-29 02:38:19.525825
1497	14	ENDN_s99VO4	Feel Good Music | ฟังเพลงชิล ฟีลสบายๆ [นอนไม่หลับ,เข้าใจใช่ไหม,ดอกไม้ในใจเธอ]	https://i.ytimg.com/vi/ENDN_s99VO4/mqdefault.jpg	\N	GMM สบาย สบาย	155	2026-05-29 02:38:19.529971
1498	14	vDem2_K53cI	ดนตรีเพราะๆ ฟังสบายๆ | Thai Pop 90’s Music #เพลงฮิต90เพราะๆ	https://i.ytimg.com/vi/vDem2_K53cI/mqdefault.jpg	\N	GMM สบาย สบาย	156	2026-05-29 02:38:19.534563
1499	14	gspnXINtDLY	𝐖𝐨𝐫𝐤 𝐌𝐮𝐬𝐢𝐜 | ฟังไปทำงานไป [เธอเอาใจฉันไป,แรงโน้มถ่วง,รักเอย]	https://i.ytimg.com/vi/gspnXINtDLY/mqdefault.jpg	\N	GMM สบาย สบาย	157	2026-05-29 02:38:19.538579
1500	14	hcK37BdZESI	Healing Chill Music | ทำงานเหนื่อยนัก ก็พักฟังเพลง [หมดชีวิต(ฉันให้เธอ),อย่าอยู่คนเดียว]	https://i.ytimg.com/vi/hcK37BdZESI/mqdefault.jpg	\N	GMM สบาย สบาย	158	2026-05-29 02:38:19.54291
1501	14	Rev43HU1jEI	ฟังเพลงอารมณ์ดีตอนเช้า | Positive Energy Music [สัญญาต้องเป็นสัญญา,ใครสัญญิงสัญญา]	https://i.ytimg.com/vi/Rev43HU1jEI/mqdefault.jpg	\N	GMM สบาย สบาย	159	2026-05-29 02:38:19.547279
1502	14	mkSbpO9zmSo	#drivingmusic | ฟังเพลิน เดินทางไกล [ฝันไป...หรือเปล่า,ฤดูรัก,sexy]	https://i.ytimg.com/vi/mkSbpO9zmSo/mqdefault.jpg	\N	GMM สบาย สบาย	160	2026-05-29 02:38:19.551311
1503	14	k32-ad1i5SI	Feel Good Music | ฟังเพลงฟีลดี รับปีใหม่ [คิด(แต่ไม่)ถึง(Same Page?),ดาว,เธอสวย]	https://i.ytimg.com/vi/k32-ad1i5SI/mqdefault.jpg	\N	GMM สบาย สบาย	161	2026-05-29 02:38:19.555537
1504	14	1xk8utGBY30	#coffeemusic Booster | ฟังเพลงฮีลใจ สายกาแฟ [YOU YOU YOU,ยิ่งรู้จัก ยิ่งรักเธอ,คนธรรมดา]	https://i.ytimg.com/vi/1xk8utGBY30/mqdefault.jpg	\N	GMM สบาย สบาย	162	2026-05-29 02:38:19.55988
1505	14	KD5ouwDEdOk	Music Chill Vibes | เพลงสบายใจ ฟังสบายหู [ขอ,ปลายสายรุ้ง,ดาว]	https://i.ytimg.com/vi/KD5ouwDEdOk/mqdefault.jpg	\N	GMM สบาย สบาย	163	2026-05-29 02:38:19.563795
1506	14	q3mjoNbjtpo	𝐂𝐨𝐟𝐟𝐞𝐞 𝐌𝐮𝐬𝐢𝐜 | จิบกาแฟฟังเพลง [นานๆ นะๆ,รักแท้..ยังไง,รักคำโตโต]	https://i.ytimg.com/vi/q3mjoNbjtpo/mqdefault.jpg	\N	GMM สบาย สบาย	164	2026-05-29 02:38:19.567741
1507	14	IR2nuMOBpwc	Good Mood Music | ฟังเพลงเก่ายุค 90 อารมณ์ดี [ยังยินดี..ครับเพื่อน,อย่าให้เขารู้,ลึกสุดใจ]	https://i.ytimg.com/vi/IR2nuMOBpwc/mqdefault.jpg	\N	GMM สบาย สบาย	165	2026-05-29 02:38:19.57364
1755	19	I-WKLZPEQpk	Ashley Wineland - Only a Minute (Official Music Video)	https://i.ytimg.com/vi/I-WKLZPEQpk/mqdefault.jpg	\N	AshleyWinelandVEVO	38	2026-06-01 00:26:26.051974
1508	14	NnHzFOwLedo	#coffeemusic Booster | ฟังเพลงฮีลใจ สายกาแฟ [คนในฝัน,อารมณ์ดี,หยุดความคิดไม่ได้]	https://i.ytimg.com/vi/NnHzFOwLedo/mqdefault.jpg	\N	GMM สบาย สบาย	166	2026-05-29 02:38:19.577718
1509	14	sCXJULpKgZE	#coffeemusic Booster | ฟังเพลงฮีลใจ สายกาแฟ [YOU YOU YOU,เนื้อคู่,ยิ่งรู้จัก ยิ่งรักเธอ]	https://i.ytimg.com/vi/sCXJULpKgZE/mqdefault.jpg	\N	GMM สบาย สบาย	167	2026-05-29 02:38:19.582644
1510	14	U4QcCSf-ENQ	Healing Chill Music | ทำงานเหนื่อยนัก ก็พักฟังเพลง [ทางกลับบ้าน,รับได้ทุกอย่าง,ด้วยความคิดถึง]	https://i.ytimg.com/vi/U4QcCSf-ENQ/mqdefault.jpg	\N	GMM สบาย สบาย	168	2026-05-29 02:38:19.586926
1511	14	GBy2YSgEY38	[PLAYLIST] เพลงฟังชิล ฟีลอยู่คาเฟ่ | Morning Coffee Music #ดนตรีบรรเลงร้านกาแฟ	https://i.ytimg.com/vi/GBy2YSgEY38/mqdefault.jpg	\N	GMM สบาย สบาย	169	2026-05-29 02:38:19.59187
1512	14	XmARR0COqgo	Feel Good Music | ฟังเพลงฟีลดี รับปีใหม่ [ตอบได้ไหมว่า...ได้ไหม,เจ้าสาวที่กลัวฝน,หยดน้ำในทะเล]	https://i.ytimg.com/vi/XmARR0COqgo/mqdefault.jpg	\N	GMM สบาย สบาย	170	2026-05-29 02:38:19.59595
1513	14	K9PERUPUVvU	Feel Good Music | ฟังเพลงชิล ฟีลสบายๆ [YOU YOU YOU,จะรักให้ดีที่สุด,ยิ่งรู้จัก ยิ่งรักเธอ]	https://i.ytimg.com/vi/K9PERUPUVvU/mqdefault.jpg	\N	GMM สบาย สบาย	171	2026-05-29 02:38:19.599911
1514	14	yHNs86Hq1zk	Good Mood Music | ฟังเพลงเก่ายุค90 อารมณ์ดี [รักเธอเสมอ,ขอใครสักคน,แพ้ใจ]	https://i.ytimg.com/vi/yHNs86Hq1zk/mqdefault.jpg	\N	GMM สบาย สบาย	172	2026-05-29 02:38:19.604266
1515	14	6NGO2kkOPEQ	#coffeemusic Booster | ฟังเพลงฮีลใจ สายกาแฟ [เหตุผลร้อยแปด,คนธรรมดา,รักษาสิทธิ์]	https://i.ytimg.com/vi/6NGO2kkOPEQ/mqdefault.jpg	\N	GMM สบาย สบาย	173	2026-05-29 02:38:19.609328
1516	14	Ic7HYWCej7E	Feel Good Music | ฟังเพลงฟีลดี รับปีใหม่ [เพียงแค่ใจเรารักกัน,ขอแค่มีเธอ]	https://i.ytimg.com/vi/Ic7HYWCej7E/mqdefault.jpg	\N	GMM สบาย สบาย	174	2026-05-29 02:38:19.613419
1517	14	SWWrzdhDeAE	#coffeemusic Booster | ฟังเพลงฮีลใจ สายกาแฟ [เธอไม่เคยรู้,รักแล้วรักเลย,ดอกไม้ในใจเธอ]	https://i.ytimg.com/vi/SWWrzdhDeAE/mqdefault.jpg	\N	GMM สบาย สบาย	175	2026-05-29 02:38:19.617306
1518	14	LJBcWyAYPz4	เติมพลัง ฟังเพลงเพราะ ตอนทำงาน | Workday Playlist [ฝนในใจ,เสียดาย,คนไม่เอาถ่าน]	https://i.ytimg.com/vi/LJBcWyAYPz4/mqdefault.jpg	\N	GMM สบาย สบาย	176	2026-05-29 02:38:19.62153
1519	14	U5fuVK09Y0k	Feel Good Music | ฟังเพลงฟีลดี รับปีใหม่ [อุ่นใจ,บันทึกหน้าสุดท้าย,ฝัน..ฝันหวาน]	https://i.ytimg.com/vi/U5fuVK09Y0k/mqdefault.jpg	\N	GMM สบาย สบาย	177	2026-05-29 02:38:19.62617
1520	14	s4scyeN3V4o	เติมพลัง ฟังเพลงเพราะ ตอนทำงาน | Workday Playlist [แพ้ใจ,ใจสั่งมา,แทนคำนั้น]	https://i.ytimg.com/vi/s4scyeN3V4o/mqdefault.jpg	\N	GMM สบาย สบาย	178	2026-05-29 02:38:19.630297
1521	14	nYvtmbDeIdw	𝐂𝐨𝐟𝐟𝐞𝐞 𝐌𝐮𝐬𝐢𝐜 | จิบกาแฟฟังเพลง [ดาว,ทำไมต้องเธอ,เข้าใจใช่ไหม]	https://i.ytimg.com/vi/nYvtmbDeIdw/mqdefault.jpg	\N	GMM สบาย สบาย	179	2026-05-29 02:38:19.634597
1522	14	hZ0GNpqSL8s	ฟังเพลงอารมณ์ดีตอนเช้า | Positive Energy Music [รักเธอที่สุด,รักเธอคนเดียว,สักวันคงเจอ]	https://i.ytimg.com/vi/hZ0GNpqSL8s/mqdefault.jpg	\N	GMM สบาย สบาย	180	2026-05-29 02:38:19.63856
1523	14	E55gC8mjgsA	เติมพลัง ฟังเพลงเพราะ ตอนทำงาน | Workday Playlist [อารมณ์ดี,เปรี้ยวใจ,คนเหงาที่ไม่เคยเหงา]	https://i.ytimg.com/vi/E55gC8mjgsA/mqdefault.jpg	\N	GMM สบาย สบาย	181	2026-05-29 02:38:19.64267
1524	14	E-x3-EsQUVs	#coffeemusic Booster | ฟังเพลงฮีลใจ สายกาแฟ [Love Message,วุ่นวาย,อย่าคิดเลย]	https://i.ytimg.com/vi/E-x3-EsQUVs/mqdefault.jpg	\N	GMM สบาย สบาย	182	2026-05-29 02:38:19.646911
1525	14	P0SDT-2ygKg	𝐖𝐨𝐫𝐤 𝐌𝐮𝐬𝐢𝐜 | ฟังไปทำงานไป [รักเอย,เธอเอาใจฉันไป,North Star]	https://i.ytimg.com/vi/P0SDT-2ygKg/mqdefault.jpg	\N	GMM สบาย สบาย	183	2026-05-29 02:38:19.651126
1526	14	d8u8rbQ-I_0	Feel Good Music | ฟังเพลงฟีลดี รับปีใหม่ [เสียงกระซิบ,เพียงแค่ใจเรารักกัน,รักเอย]	https://i.ytimg.com/vi/d8u8rbQ-I_0/mqdefault.jpg	\N	GMM สบาย สบาย	184	2026-05-29 02:38:19.655358
1527	14	RMANnE1QEiE	เพลงฟังชิล ฟีลอยู่คาเฟ่ | Morning Coffee Music [ซ่อนกลิ่น,พรุ่งนี้...ไม่สาย,ด้วยความคิดถึง]	https://i.ytimg.com/vi/RMANnE1QEiE/mqdefault.jpg	\N	GMM สบาย สบาย	185	2026-05-29 02:38:19.65937
1528	14	m2sFN1b__aE	#drivingmusic | ฟังเพลิน เดินทางไกล [เธอสวย,อยู่คนเดียว...ไม่ได้แล้ว,ใจบอกว่าใช่]	https://i.ytimg.com/vi/m2sFN1b__aE/mqdefault.jpg	\N	GMM สบาย สบาย	186	2026-05-29 02:38:19.663483
1529	14	nKTj-H0Wqrg	เปิดเพลงฟัง ตอนนั่งชิลๆ | Music Chill Vibes [ฟ้าส่งฉันมา,ห้องสี่มุมซ้าย,เรื่องของเรา]	https://i.ytimg.com/vi/nKTj-H0Wqrg/mqdefault.jpg	\N	GMM สบาย สบาย	187	2026-05-29 02:38:19.667814
1530	14	h1pTNwcyL_8	Healing #loungemusic | พักใจฟังเพลงเพราะ [คิดถึงฉันไหมเวลาที่เธอ,หากตอนนี้เธอยังไม่เกิด]	https://i.ytimg.com/vi/h1pTNwcyL_8/mqdefault.jpg	\N	GMM สบาย สบาย	188	2026-05-29 02:38:19.67169
1756	19	GOimHP_pVeg	Backup Plan	https://i.ytimg.com/vi/GOimHP_pVeg/mqdefault.jpg	\N	Bailey Zimmerman - Topic	39	2026-06-01 00:26:26.058019
1531	14	-i9XtBfG3Pc	Good Mood Music | ฟังเพลงเก่า อารมณ์ดี [คนไม่มีแฟน,เพียงชายคนนี้ (ไม่ใช่ผู้วิเศษ)]	https://i.ytimg.com/vi/-i9XtBfG3Pc/mqdefault.jpg	\N	GMM สบาย สบาย	189	2026-05-29 02:38:19.676374
1532	14	hdPEdBnUMvo	ฟังเพลงอารมณ์ดีตอนเช้า | Positive Energy Music [พรุ่งนี้...ไม่สาย,ขอให้เหมือนเดิม,แน่ใจว่ารัก]	https://i.ytimg.com/vi/hdPEdBnUMvo/mqdefault.jpg	\N	GMM สบาย สบาย	190	2026-05-29 02:38:19.68054
1533	14	Ar9mT4mq5EI	Good Mood Music | ฟังเพลงเก่ายุค2000 อารมณ์ดี [ปลายสายรุ้ง,ดาว,มากกว่ารัก]	https://i.ytimg.com/vi/Ar9mT4mq5EI/mqdefault.jpg	\N	GMM สบาย สบาย	191	2026-05-29 02:38:19.685269
1534	14	SMqR47ekRfI	เพลงฟังชิล ฟีลอยู่คาเฟ่ | Morning Coffee Music [คนไม่มีแฟน,ยกเว้นเรื่องเธอ,แค่อยากจะบอก]	https://i.ytimg.com/vi/SMqR47ekRfI/mqdefault.jpg	\N	GMM สบาย สบาย	192	2026-05-29 02:38:19.689341
1535	14	JcBn5FG25Hc	𝐂𝐨𝐟𝐟𝐞𝐞 𝐌𝐮𝐬𝐢𝐜 | จิบกาแฟฟังเพลง [เราคงต้องเป็นแฟนกัน,อย่าทำให้ฉันรักเธอ,Love Message]	https://i.ytimg.com/vi/JcBn5FG25Hc/mqdefault.jpg	\N	GMM สบาย สบาย	193	2026-05-29 02:38:19.694352
1536	14	iUle4EHgnfc	Good Mood Music | ฟังเพลงเก่า 80-90's อารมณ์ดี [ทรายกับทะเล,ชายคนหนึ่ง,ลึกสุดใจ]	https://i.ytimg.com/vi/iUle4EHgnfc/mqdefault.jpg	\N	GMM สบาย สบาย	194	2026-05-29 02:38:19.698695
1537	14	TvyZwWM2Nmk	[PLAYLIST] เปิดเพลงฟัง ตอนนั่งชิลๆ | Music Chill Vibes #เพลงบรรเลงผ่อนคลาย	https://i.ytimg.com/vi/TvyZwWM2Nmk/mqdefault.jpg	\N	GMM สบาย สบาย	195	2026-05-29 02:38:19.704802
1538	14	VKz6o09EVU0	ฟังเพลงอารมณ์ดีตอนเช้า | The best stretching music mix! [ใครสักคน,อดใจไม่ไหว,ไม่เคยเปลี่ยน]	https://i.ytimg.com/vi/VKz6o09EVU0/mqdefault.jpg	\N	GMM สบาย สบาย	196	2026-05-29 02:38:19.709753
1539	14	sEvYJmoX7Pc	[PLAYLIST] Music Chill Vibes | เปิดเพลงฟัง ตอนนั่งชิลๆ #ฟังเพลงสบายๆ	https://i.ytimg.com/vi/sEvYJmoX7Pc/mqdefault.jpg	\N	GMM สบาย สบาย	197	2026-05-29 02:38:19.714844
1540	14	W21eB5gVp0Y	#drivingmusic | ฟังเพลิน เดินทางไกล [วุ่นวาย,แรงโน้มถ่วง,คนธรรมดา]	https://i.ytimg.com/vi/W21eB5gVp0Y/mqdefault.jpg	\N	GMM สบาย สบาย	198	2026-05-29 02:38:19.719114
1541	14	qdmwycZRQUQ	พักงาน พักใจไปฟังเพลง | Take a Break Playlist [SOMEONE,แค่คนอีกคน,พูดในใจ]	https://i.ytimg.com/vi/qdmwycZRQUQ/mqdefault.jpg	\N	GMM สบาย สบาย	199	2026-05-29 02:38:19.723961
1542	14	7MDhZOyVKZ4	ฟังเพลงชิล ตอนจิบชา | Tea Break Music [พูดในใจ,จากคนรักเก่า,กลับมาได้ไหม]	https://i.ytimg.com/vi/7MDhZOyVKZ4/mqdefault.jpg	\N	GMM สบาย สบาย	200	2026-05-29 02:38:19.727868
1548	15	dZby0E-RChI	ROCKET FESTIVAL (สัญญาเดือนหก) - โจอี้ ภูวศิษฐ์ (JOEY PHUWASIT)「Official MV」	https://i.ytimg.com/vi/dZby0E-RChI/mqdefault.jpg	\N	Genierock	6	2026-05-30 04:08:34.968517
1549	15	LQvu1L-R0Jo	ของตาย - โจอี้ ภูวศิษฐ์ (JOEY PHUWASIT)「Official MV」	https://i.ytimg.com/vi/LQvu1L-R0Jo/mqdefault.jpg	\N	Genierock	7	2026-05-30 04:08:34.97397
1550	15	RPagIqN3AWE	นิดหน่อย - โจอี้ ภูวศิษฐ์ (JOEY PHUWASIT) 「Official MV」	https://i.ytimg.com/vi/RPagIqN3AWE/mqdefault.jpg	\N	Genierock	8	2026-05-30 04:08:34.979494
1551	15	ViSye6eAXBM	อยากร้องดังดัง - ปาล์มมี่【OFFICIAL MV】	https://i.ytimg.com/vi/ViSye6eAXBM/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	9	2026-05-30 04:08:34.985305
1552	15	dFD7uWUs32o	Neon - PALMY「Official MV」	https://i.ytimg.com/vi/dFD7uWUs32o/mqdefault.jpg	\N	Genierock	10	2026-05-30 04:08:34.990427
1553	15	wqJsZYibWcI	ซ่อนกลิ่น - PALMY「Official MV」	https://i.ytimg.com/vi/wqJsZYibWcI/mqdefault.jpg	\N	Genierock	11	2026-05-30 04:08:34.995738
1554	15	tUuqWFExZgY	LOMOSONIC - ขอ (WARM EYES) [Official Music Video]	https://i.ytimg.com/vi/tUuqWFExZgY/mqdefault.jpg	\N	SMALLROOM	12	2026-05-30 04:08:35.001376
1555	15	DgQqcQQqAv0	ยังไม่กลับ (POINT OF NO RETURN) - LOMOSONIC Feat.ไม้เมือง「Official MV」	https://i.ytimg.com/vi/DgQqcQQqAv0/mqdefault.jpg	\N	Genierock	13	2026-05-30 04:08:35.006901
1556	15	apljdslXJks	Lomosonic - ถึงเวลา.... (Wake) [official Single]	https://i.ytimg.com/vi/apljdslXJks/mqdefault.jpg	\N	SMALLROOM	14	2026-05-30 04:08:35.01255
1557	15	fJKasTangEM	แดนเนรมิต - BIG ASS「Official MV」	https://i.ytimg.com/vi/fJKasTangEM/mqdefault.jpg	\N	Genierock	15	2026-05-30 04:08:35.01812
1558	15	hSrMyPdkAqs	ถ้ารู้อย่างนี้ - BIG ASS「Official MV」	https://i.ytimg.com/vi/hSrMyPdkAqs/mqdefault.jpg	\N	Genierock	16	2026-05-30 04:08:35.02462
1559	15	5H4Lg-rl58U	ลมเปลี่ยนทิศ - BIG ASS「Official MV」	https://i.ytimg.com/vi/5H4Lg-rl58U/mqdefault.jpg	\N	Genierock	17	2026-05-30 04:08:35.030031
1560	15	zYNsQ6ibdZs	ทิ้งไว้กลางทาง - POTATO「Official MV」	https://i.ytimg.com/vi/zYNsQ6ibdZs/mqdefault.jpg	\N	Genierock	18	2026-05-30 04:08:35.0356
1561	15	2JIn3pD5IXM	ยินดี - POTATO「Official MV」	https://i.ytimg.com/vi/2JIn3pD5IXM/mqdefault.jpg	\N	Genierock	19	2026-05-30 04:08:35.041585
1562	15	UHKS37Inpdc	เท่าไหร่ไม่จำ - POTATO「Official MV」	https://i.ytimg.com/vi/UHKS37Inpdc/mqdefault.jpg	\N	Genierock	20	2026-05-30 04:08:35.046382
1563	15	F_v_Qj6watw	รักใครไม่ไหว - Three Man Down |Official MV|	https://i.ytimg.com/vi/F_v_Qj6watw/mqdefault.jpg	\N	GeneLab	21	2026-05-30 04:08:35.051858
1564	15	LCuxGozZh7c	เหตุผล - Three Man Down Feat. whateve |Official MV|	https://i.ytimg.com/vi/LCuxGozZh7c/mqdefault.jpg	\N	GeneLab	22	2026-05-30 04:08:35.057922
1565	15	OYPiXBIgvJ8	เพลงรัก - Three Man Down |Official MV|	https://i.ytimg.com/vi/OYPiXBIgvJ8/mqdefault.jpg	\N	GeneLab	23	2026-05-30 04:08:35.063175
1566	15	bu-egkiKy78	แอบเก็บความในใจไว้ภายในแว่นเรย์แบนสีดำ - TaitosmitH |Official MV|	https://i.ytimg.com/vi/bu-egkiKy78/mqdefault.jpg	\N	GeneLab	24	2026-05-30 04:08:35.069546
1567	15	v18ik7DRFNQ	ว่าไงคนเก่ง - TaitosmitH |Official MV|	https://i.ytimg.com/vi/v18ik7DRFNQ/mqdefault.jpg	\N	GeneLab	25	2026-05-30 04:08:35.074845
1568	15	DkKr8fGIrCM	นักเลงเก่า - TaitosmitH Feat. D GERRARD |Official MV| เพลงประกอบภาพยนตร์ 4KINGS	https://i.ytimg.com/vi/DkKr8fGIrCM/mqdefault.jpg	\N	GeneLab	26	2026-05-30 04:08:35.079714
1569	15	CAczP1iF1co	ยาพิษ - bodyslam【OFFICIAL MV】	https://i.ytimg.com/vi/CAczP1iF1co/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	27	2026-05-30 04:08:35.085706
1570	15	5zO7E1oJuQM	ครึ่งหลัง - bodyslam「Official MV」	https://i.ytimg.com/vi/5zO7E1oJuQM/mqdefault.jpg	\N	Genierock	28	2026-05-30 04:08:35.091346
1571	15	ReUGJf6FxhM	อกหัก - bodyslam【OFFICIAL MV】	https://i.ytimg.com/vi/ReUGJf6FxhM/mqdefault.jpg	\N	GMM GRAMMY OFFICIAL	29	2026-05-30 04:08:35.096384
1572	16	KyPLo-FXj5U	รวมเพลงคาราบาว 3 ช่า มหาชน | ฟังยาวๆ 1 ชั่วโมง	https://i.ytimg.com/vi/KyPLo-FXj5U/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	1	2026-05-30 10:09:01.802876
1573	16	X7X1BfNJ-3c	รวมตำนานเพลงเพื่อชีวิต คาราบาว ปู พงษ์สิทธิ์ พงษ์เทพ กระโดนชำนาญ	https://i.ytimg.com/vi/X7X1BfNJ-3c/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	2	2026-05-30 10:09:01.808311
1574	16	Oz7-KYZQf7Y	ปู พงษ์สิทธิ์ คำภีร์ ที่สุดของตำนาน | รวมเพลงฮิตทะลุ 100 ล้านวิว (เลือกรักเธอ, ขอโทษ, แค่นั้น)	https://i.ytimg.com/vi/Oz7-KYZQf7Y/mqdefault.jpg	\N	สถานีเพลงฮิตเพื่อชีวิต	3	2026-05-30 10:09:01.813439
1575	16	FLYI1USGwM4	รวมเพลงฮิตถนนสายเพื่อชีวิต พงษ์สิทธิ์ คำภีร์【ตลอดเวลา, เสมอ, แค่นั้น ฯลฯ】	https://i.ytimg.com/vi/FLYI1USGwM4/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	4	2026-05-30 10:09:01.818818
1576	16	vjh4XhTcl3s	รวมเพลงปู พงษ์สิทธิ์ คำภีร์ คำภีร์โคตรฮิต	https://i.ytimg.com/vi/vjh4XhTcl3s/mqdefault.jpg	\N	สถานีเพลงฮิตเพื่อชีวิต	5	2026-05-30 10:09:01.823871
1577	16	16Ot1ha8lsg	รวมเพลง 3ช่า คาราบาว 2025【ปีนี้สามช่าปีหน้าค่อยว่ากัน】	https://i.ytimg.com/vi/16Ot1ha8lsg/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	6	2026-05-30 10:09:01.828806
1578	16	lf87kLTTgeU	รวมเพลงคนเพื่อชีวิต - คาราบาว | พงษ์สิทธิ์ คำภีร์ | พงษ์เทพ กระโดนชำนาญ | ทอม ดันดี	https://i.ytimg.com/vi/lf87kLTTgeU/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	7	2026-05-30 10:09:01.833329
1579	16	5QS2DTcVYyc	รวมเพลงเพื่อชีวิตโคตรเดือด คาราบาว, ปู พงษ์สิทธิ์ คำภีร์	https://i.ytimg.com/vi/5QS2DTcVYyc/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	8	2026-05-30 10:09:01.837902
1580	16	_K-vuny2LfI	รวมเพลงรักเพื่อชีวิต - ปู พงษ์สิทธิ์ คำภีร์ & คาราบาว	https://i.ytimg.com/vi/_K-vuny2LfI/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	9	2026-05-30 10:09:01.842628
1581	16	_qH9331vyno	รวมเพลงคาราบาว เพลงหาฟังยาก ฟังยาวๆ 2 ชั่วโมงเต็ม	https://i.ytimg.com/vi/_qH9331vyno/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	10	2026-05-30 10:09:01.847205
1582	16	C-0XwHgJWoA	รวมเพลง คาราบาว "ตำนานบทสุดท้าย" | 43 ปี คาราบาว [Hi-Res Audio]	https://i.ytimg.com/vi/C-0XwHgJWoA/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	11	2026-05-30 10:09:01.851739
1583	16	N7krYdnyaI8	รวมเพลง 35 ปี "ปู พงษ์สิทธิ์ คำภีร์ "	https://i.ytimg.com/vi/N7krYdnyaI8/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	12	2026-05-30 10:09:01.856467
1584	16	_rRv5IhefWI	รวมเพลงคาราบาว 3 ช่า 20 เพลงรวด Non-Stop【กีตาร์คิงส์,ยายสำอาง,คนล่าฝัน,หลวงพ่อคูณ ฯลฯ】	https://i.ytimg.com/vi/_rRv5IhefWI/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	13	2026-05-30 10:09:01.861119
1585	16	z7lWALBculQ	รวมเพลงฮิต"คาราบาว" ยุคคลาสสิค - ปัจจุบัน 40 ปี 40 บทเพลง【40 ปี ฅนคาราบาว】	https://i.ytimg.com/vi/z7lWALBculQ/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	14	2026-05-30 10:09:01.867141
1586	16	zlf9dPYdVLk	รวมเพลงตำนานเพื่อชีวิต "รุ่นใหญ่" - พงษ์สิทธิ์ คำภีร์ | คาราบาว | ซูซู | หมู พงษ์เทพ | หงา คาราวาน	https://i.ytimg.com/vi/zlf9dPYdVLk/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	15	2026-05-30 10:09:01.871941
1587	16	Qbc_pYViAS8	รวมเพลงเพื่อชีวิต ปู พงษ์สิทธิ์ คำภีร์ | คาราบาว ชุด【"รัก เหงา กำลังใจ"】	https://i.ytimg.com/vi/Qbc_pYViAS8/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	16	2026-05-30 10:09:01.877053
1588	16	xXdgq5Yfbxs	รวมเพลงเพื่อชีวิต เพราะๆ ซึ้งๆ กินใจ - พงษ์เทพ กระโดนชำนาญ | คาราบาว | พงษ์สิทธิ์ คำภีร์	https://i.ytimg.com/vi/xXdgq5Yfbxs/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	17	2026-05-30 10:09:01.881913
1589	16	Ug4_RZQHnfY	รวมเพลงปู พงษ์สิทธิ์ คำภีร์【คำภีร์โคตรฮิต2】	https://i.ytimg.com/vi/Ug4_RZQHnfY/mqdefault.jpg	\N	สถานีเพลงฮิตเพื่อชีวิต	18	2026-05-30 10:09:01.88649
1590	16	yLcHO58yfeA	รวมเพลงเพื่อชีวิต มันส์ ๆ - คาราบาว , พงษ์สิทธิ์ คำภีร์ [Non-Stop] ฟังยาวๆ	https://i.ytimg.com/vi/yLcHO58yfeA/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	19	2026-05-30 10:09:01.891151
1591	16	Q6YSiX5bTh4	รวมเพลงเพื่อชีวิต "แอ๊ด คาราบาว" & "หมู ไววิทย์"【จากรุ่นใหญ่สู่รุ่นใหม่】	https://i.ytimg.com/vi/Q6YSiX5bTh4/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	20	2026-05-30 10:09:01.895658
1615	16	slr7yiX7DDk	รวมเพลงคาราบาวมันส์ๆ (เวอร์ชันแสดงสด)	https://i.ytimg.com/vi/slr7yiX7DDk/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	44	2026-05-30 10:09:02.013107
1592	16	n_KKIkfbLhc	รวมเพลงเพื่อชีวิตเพลงมันส์ๆ พงษ์สิทธิ์ คำภีร์ & คาราบาว【รวมฮิตเพื่อชีวิตติดมันส์】	https://i.ytimg.com/vi/n_KKIkfbLhc/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	21	2026-05-30 10:09:01.900292
1593	16	iyTgIXUGWU4	รวมเพลงเพื่อชีวิต3ช่า โจ๊ะๆมันส์ๆ ฟังวันสงกรานต์ - คาราบาว | ปู พงษ์สิทธิ์ | หมู พงษ์เทพ | ทอม ดันดี	https://i.ytimg.com/vi/iyTgIXUGWU4/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	22	2026-05-30 10:09:01.904829
1594	16	1GyLAO150v0	รวมเพลงรักเพื่อชีวิต - พงษ์สิทธิ์ คำภีร์, คาราบาว, หมู พงษ์เทพ, ซูซู	https://i.ytimg.com/vi/1GyLAO150v0/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	23	2026-05-30 10:09:01.909689
1595	16	cOZgEKaZ_3Q	รวมเพลง 3 ตำนานเพื่อชีวิต พงษ์เทพ กระโดนชำนาญ | คาราบาว | พงษ์สิทธิ์ คำภีร์	https://i.ytimg.com/vi/cOZgEKaZ_3Q/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	24	2026-05-30 10:09:01.914679
1596	16	9ntF_jgNuuM	รวมเพลง ปู พงษ์สิทธิ์ คำภีร์ [รวมเพลงสู้ชีวิต]	https://i.ytimg.com/vi/9ntF_jgNuuM/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	25	2026-05-30 10:09:01.919777
1597	16	VPcM-4VEUNM	รวมเพลงเพื่อชีวิต - พงษ์สิทธิ์ คำภีร์ & คาราบาว	https://i.ytimg.com/vi/VPcM-4VEUNM/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	26	2026-05-30 10:09:01.92449
1598	16	nJxoLZigGBw	เพื่อชีวิต เศร้า เหงา กินใจ - ปู พงษ์สิทธิ์ คำภีร์ | คาราบาว【LONG PLAY】	https://i.ytimg.com/vi/nJxoLZigGBw/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	27	2026-05-30 10:09:01.929777
1599	16	jKzs18a7wCM	รวมเพลงเพื่อชีวิต - ปู พงษ์สิทธิ์, คาราบาว, เสือสองเล (ยายสา)	https://i.ytimg.com/vi/jKzs18a7wCM/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	28	2026-05-30 10:09:01.93408
1600	16	jMFxpi4MdaE	รวมเพลงปู พงษ์สิทธิ์ คำภีร์ ฮิตตลอดกาล【35ปี คำภีร์】	https://i.ytimg.com/vi/jMFxpi4MdaE/mqdefault.jpg	\N	สถานีเพลงฮิตเพื่อชีวิต	29	2026-05-30 10:09:01.93911
1601	16	gHtM-dWQzzo	รวมเพลงฮิตซูซู เพลงเพื่อชีวิตเพราะๆ มันส์ๆ ฟังยาวต่อเนื่อง【ZUZUReturns】	https://i.ytimg.com/vi/gHtM-dWQzzo/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	30	2026-05-30 10:09:01.943373
1602	16	mhhJnlS49aI	คาราบาว | รวมเพลงถึกควายทุย ภาค 1-10 【LongPlay】	https://i.ytimg.com/vi/mhhJnlS49aI/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	31	2026-05-30 10:09:01.948443
1603	16	YzrmWNYw1N4	รวมเพลงเพื่อชีวิต โคตรฮิต - พงษ์สิทธิ์ คำภีร์, คาราบาว, คาราวาน, พงษ์เทพ กระโดนชำนาญ, ซูซู	https://i.ytimg.com/vi/YzrmWNYw1N4/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	32	2026-05-30 10:09:01.952852
1604	16	JLqaf-ti59k	Coco Jazz - คิดถึง...คาราบาว 【LONGPLAY ALBUM】	https://i.ytimg.com/vi/JLqaf-ti59k/mqdefault.jpg	\N	วันวานยังฟังอยู่	33	2026-05-30 10:09:01.957679
1605	16	G6-Dh-NBb7g	รวมเพลงฮิตเพื่อชีวิต 40ปี คาราบาว 3ช่า มันส์ๆ【ฉบับเสียงดีที่สุด】	https://i.ytimg.com/vi/G6-Dh-NBb7g/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	34	2026-05-30 10:09:01.962112
1606	16	7rAUpQTeu8Y	รวมเพลงเพื่อชีวิต เพราะๆ ซึ้งๆ - ปู พงษ์สิทธิ์ คำภีร์ , แอ๊ด คาราบาว【เพื่อชีวิตคิดถึงบ้าน】	https://i.ytimg.com/vi/7rAUpQTeu8Y/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	35	2026-05-30 10:09:01.967542
1607	16	Z0-wJ-ITi6w	รวมเพลงเพื่อชีวิต "แอ๊ด คาราบาว"【ฟังเพลินๆเดินทางกลับบ้าน】	https://i.ytimg.com/vi/Z0-wJ-ITi6w/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	36	2026-05-30 10:09:01.972193
1608	16	xIsDVoZ9jRI	รวมเพลงฮิตลูกทุ่งเพื่อชีวิต - พงษ์สิทธิ์ คำภีร์ | แอ๊ด คาราบาว | ทอม ดันดี	https://i.ytimg.com/vi/xIsDVoZ9jRI/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	37	2026-05-30 10:09:01.977764
1609	16	LboB3kXATA4	รวมเพลงเพื่อชีวิตขึ้นหิ้ง คาราบาว | พงษ์สิทธิ์ คำภีร์ | พงษ์เทพ กระโดนชำนาญ | ทอม ดันดี | ซูซู	https://i.ytimg.com/vi/LboB3kXATA4/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	38	2026-05-30 10:09:01.982465
1610	16	-pCSmuoJA0Q	รวมเพลงปู พงษ์สิทธิ์ คำภีร์【คำภีร์โคตรฮิต】	https://i.ytimg.com/vi/-pCSmuoJA0Q/mqdefault.jpg	\N	สถานีเพลงฮิตเพื่อชีวิต	39	2026-05-30 10:09:01.987922
1611	16	rDkIbN69y6g	รวมเพลงเพื่อชีวิต 3ช่า มันส์ๆ -  พงษ์เทพ กระโดนชำนาญ | คาราบาว | พงษ์สิทธิ์ คำภีร์	https://i.ytimg.com/vi/rDkIbN69y6g/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	40	2026-05-30 10:09:01.992843
1612	16	EA6dDJ_MwBM	รวมเพลงเพื่อชีวิต คาราบาว | พงษ์สิทธิ์ คำภีร์ | พงษ์เทพ กระโดนชำนาญ	https://i.ytimg.com/vi/EA6dDJ_MwBM/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	41	2026-05-30 10:09:01.998058
1613	16	HW16iddyez4	รวมเพลงเศร้าเพื่อชีวิต【 พงษ์สิทธิ์ คำภีร์ 】	https://i.ytimg.com/vi/HW16iddyez4/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	42	2026-05-30 10:09:02.002694
1614	16	bTyKIcruEN0	รวมเพลงฮิตเพื่อชีวิต พงษ์สิทธิ์ คำภีร์ , แอ๊ด คาราบาว	https://i.ytimg.com/vi/bTyKIcruEN0/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	43	2026-05-30 10:09:02.007926
1616	16	bZ55aEvtJ34	รวมเพลงการเมือง - แอ๊ด คาราบาว「ประชาธิปไตย」	https://i.ytimg.com/vi/bZ55aEvtJ34/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	45	2026-05-30 10:09:02.018462
1617	16	D5_hiUKX5Cs	รวมเพลงเพื่อชีวิต ฮิตทั้งแผ่นดิน - พงษ์สิทธิ์ คำภีร์ / คาราบาว / พงษ์เทพ กระโดนชำนาญ / ซูซู	https://i.ytimg.com/vi/D5_hiUKX5Cs/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	46	2026-05-30 10:09:02.023658
1618	16	c1AayU7KPac	รวมเพลง พงษ์สิทธิ์ คำภีร์ ร้องเพลง คาราวาน [ช่างมันฉันไม่แคร์ , ดอกไม้ให้คุณ , คนนอกคอก]	https://i.ytimg.com/vi/c1AayU7KPac/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	47	2026-05-30 10:09:02.02851
1619	16	pWTmAgHDYA0	รวมเพลงปู พงษ์สิทธ์ คำภีร์ | แอ๊ด คาราบาว【ฟังยาวๆ 1 ชั่วโมง】#เพลงเพื่อชีวิต	https://i.ytimg.com/vi/pWTmAgHDYA0/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	48	2026-05-30 10:09:02.034653
1620	16	CdGnoNu0VEc	รอบนี้ 3 ช่า เพื่อชีวิต - คาราบาว | พงษ์สิทธิ์ คำภีร์ [Non-Stop]	https://i.ytimg.com/vi/CdGnoNu0VEc/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	49	2026-05-30 10:09:02.039747
1621	16	hgMQTKnFeSQ	รวมเพลงมันๆ 40 ปี คาราบาว 3 ช่า 30 เพลงรวด【เจ้าตาก,บางระจัน,วณิพก,เมดอินไทยแลนด์ฯลฯ】	https://i.ytimg.com/vi/hgMQTKnFeSQ/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	50	2026-05-30 10:09:02.044606
1622	16	MuQO3pOSQVk	รวมเพลงเพื่อชีวิต...คิดถึงบ้าน - พงษ์สิทธิ์ คำภีร์ | คาราบาว | พงษ์เทพ กระโดนชำนาญ	https://i.ytimg.com/vi/MuQO3pOSQVk/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	51	2026-05-30 10:09:02.04905
1623	16	rWaagHPbNGs	รวมเพลงเพื่อชีวิต คาราบาว ปู พงษ์สิทธิ์ คำภีร์ พงษ์เทพ กระโดนชำนาญ【ฅนเพื่อชีวิต】	https://i.ytimg.com/vi/rWaagHPbNGs/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	52	2026-05-30 10:09:02.053396
1624	16	yMfXsoe-xA8	รวมเพลงเพื่อชีวิต โคตรฮิต - พงษ์เทพ กระโดนชำนาญ / คาราบาว / พงษ์สิทธิ์ คำภีร์	https://i.ytimg.com/vi/yMfXsoe-xA8/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	53	2026-05-30 10:09:02.058338
1625	16	jECYFJz5Ogw	โตมากับคาราบาว | รวมเพลงคาราบาว ยุคคลาสสิค	https://i.ytimg.com/vi/jECYFJz5Ogw/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	54	2026-05-30 10:09:02.062817
1626	16	nbJva98RwWU	คาราบาว รวมเพลงสู้ศึก【ขวานไทยใจหนึ่งเดียว】	https://i.ytimg.com/vi/nbJva98RwWU/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	55	2026-05-30 10:09:02.067352
1627	16	Ti6PyzDbMGc	รวมเพลงเพื่อชีวิต พงษ์สิทธิ์ คำภีร์ เศร้ากินใจ	https://i.ytimg.com/vi/Ti6PyzDbMGc/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	56	2026-05-30 10:09:02.072025
1628	16	t6pDbOnF9ZE	รวมฮิต กวีศรีชาวไร่ "พงษ์เทพ กระโดนชำนาญ" 【ฟังยาวต่อเนื่อง 1 ชั่วโมง】	https://i.ytimg.com/vi/t6pDbOnF9ZE/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	57	2026-05-30 10:09:02.07758
1629	16	gUS4GRC7ooA	รวมเพลงคาราบาว ฟังสบายๆ สไตล์บาว	https://i.ytimg.com/vi/gUS4GRC7ooA/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	58	2026-05-30 10:09:02.082793
1630	16	gcPgHhUH8Pw	รวมเพลง 3 ช่า เพื่อชีวิต ฟังยาวๆ ปีใหม่ 2568 | คาราบาว & พงษ์สิทธิ์ คำภีร์	https://i.ytimg.com/vi/gcPgHhUH8Pw/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	59	2026-05-30 10:09:02.088059
1631	16	IeFG41tmvY4	บันทึกเส้นทาง 3 ตำนานเพื่อชีวิต - พงษ์สิทธิ์ คำภีร์ | คาราบาว | พงษ์เทพ กระโดนชำนาญ	https://i.ytimg.com/vi/IeFG41tmvY4/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	60	2026-05-30 10:09:02.09242
1632	16	OSebqF_qufE	คาราบาว - มนต์เพลง...การเมือง | รวมบทเพลงบันทึกประวัติศาสตร์ประชาธิปไตย	https://i.ytimg.com/vi/OSebqF_qufE/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	61	2026-05-30 10:09:02.097891
1633	16	l7C_ftPLhoY	รวมเพลง 3 ช่าเพื่อชีวิต ฟังยาวต่อเนื่อง 2026 | คาราบาว, ปู พงษ์สิทธิ์, หมู พงษ์เทพ, ซูซู	https://i.ytimg.com/vi/l7C_ftPLhoY/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	62	2026-05-30 10:09:02.102838
1634	16	I7CX0Nn7i10	รวมเพลงให้กำลังใจ ปู พงษ์สิทธิ์ คำภีร์ | ใจยังมีหวัง	https://i.ytimg.com/vi/I7CX0Nn7i10/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	63	2026-05-30 10:09:02.107654
1635	16	xAm55QnLqoI	รวมเพลงฮิต คาราบาว 30 บทเพลงระดับตำนาน | ฟังต่อเนื่องยาวๆ ไม่มีสะดุด [Long Play]	https://i.ytimg.com/vi/xAm55QnLqoI/mqdefault.jpg	\N	เพลงฮิตขึ้นหิ้ง	64	2026-05-30 10:09:02.112518
1636	17	1fCPuYxLq2c	เพลงดังในอดีต เพลงสากลฟังสบาย เวลาฝนตก 2ชม ( oldies music with rainyday,easy listening oldie songs)	https://i.ytimg.com/vi/1fCPuYxLq2c/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	1	2026-06-01 00:25:39.66041
1637	17	5cmwyLM3KkQ	รวมเพลงสากลเก่าๆ รุ่นเก๋าชอบฟัง |เพลงดังในอดีต เพลงสากลฟังสบาย เวลาฝนตก (easy listening oldie songs)	https://i.ytimg.com/vi/5cmwyLM3KkQ/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	2	2026-06-01 00:25:39.671301
1638	17	9HJ-g4F8IsQ	เพลงสากลเก่าเพราะๆใน ยุค90 ไม่มีโฆษณา - oldies but goodies 50's 60's 70's	https://i.ytimg.com/vi/9HJ-g4F8IsQ/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	3	2026-06-01 00:25:39.676986
1639	17	X6RbelhIUXM	เพลงดังในอดีต เพลงสากลฟังสบาย เวลาฝนตก 1ชม ( easy listening sad oldies songs with rainy days )	https://i.ytimg.com/vi/X6RbelhIUXM/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	4	2026-06-01 00:25:39.685561
1640	17	cSTjE2o09TE	รวมเพลงสากลเกาๆ รนเกาชอบฟง - Greatest Hits Golden Oldies 50s 60s 70s	https://i.ytimg.com/vi/cSTjE2o09TE/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	5	2026-06-01 00:25:39.694588
1641	17	MJ_NEw3e_w4	รวมเพลงรักเศร้าๆ เหมาะฟังตอนฝนตก - oldies music with rain	https://i.ytimg.com/vi/MJ_NEw3e_w4/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	6	2026-06-01 00:25:39.701848
1642	17	BujIaaauWl4	รวมเพลงสตริงเก่า เพื่อชีวิต 60 เพลง เพลงสตริงเก่า ย้ นพเก้า รวมดาว ต้อมปุ้ย รวมเพลงคู่สุดซึ้ง	https://i.ytimg.com/vi/BujIaaauWl4/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	7	2026-06-01 00:25:39.707682
1643	17	4VRSpqN3GXI	รวมเพลงสากลเก่าๆ รุ่นเก๋าชอบฟัง || Greatest Hits Golden Oldies 50's ,60's & 70's	https://i.ytimg.com/vi/4VRSpqN3GXI/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	8	2026-06-01 00:25:39.713844
1644	17	mP2gs7LNpoA	เพลงเก่าที่คิดถึงยุค90	https://i.ytimg.com/vi/mP2gs7LNpoA/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	9	2026-06-01 00:25:39.720311
1645	17	KtIOCp1fbJ0	รวมเพลงสตริงเก่ายุค 80 สตริงเก่า80 เบสแน่น	https://i.ytimg.com/vi/KtIOCp1fbJ0/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	10	2026-06-01 00:25:39.726539
1646	17	9NWZGWu6ZT4	รวมเพลงเพราะๆยุค90	https://i.ytimg.com/vi/9NWZGWu6ZT4/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	11	2026-06-01 00:25:39.732064
1647	17	u10BEHHhGYs	เพลงสากลเกาเพราะๆใน ยค90 ไมมโฆษณา oldies but goodies 50s 60s	https://i.ytimg.com/vi/u10BEHHhGYs/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	12	2026-06-01 00:25:39.738115
1648	17	fy-Ta65kgq4	เพลงสากลเก่า บ้านก๋วยเตี๋ยว ซ.แจ้งวัฒนะปากเกร็ด10 จ.นนทบุรี	https://i.ytimg.com/vi/fy-Ta65kgq4/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	13	2026-06-01 00:25:39.744488
1649	17	rYY3fTmTG0I	รวมเพลงสากลเก่าๆ รุ่นเก๋าชอบฟัง || Greatest Hits Golden Oldies 50's ,60's & 70's	https://i.ytimg.com/vi/rYY3fTmTG0I/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	14	2026-06-01 00:25:39.751517
1650	17	AgnVUTUHHUA	รวมเพลงสากลเก่าๆเพราะๆ สนุกๆ|| สากลยุค80-90|| Oldies Music	https://i.ytimg.com/vi/AgnVUTUHHUA/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	15	2026-06-01 00:25:39.757692
1651	17	EIZ_eARWTwM	รวมเพลงสากลเก่าๆเพราะๆ สนุกๆ|| สากลยุค80-90|| Oldies Music	https://i.ytimg.com/vi/EIZ_eARWTwM/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	16	2026-06-01 00:25:39.763768
1652	17	66FcFFQsovE	รวมเพลงสากลช้าๆเพราะๆ	https://i.ytimg.com/vi/66FcFFQsovE/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	17	2026-06-01 00:25:39.76948
1653	17	SOFQzAHsSgI	รวมเพลงสากลเก่าๆ รุ่นเก๋าชอบฟัง|| เพลง สากล เก่า เพราะ ๆ|| Oldies Songs	https://i.ytimg.com/vi/SOFQzAHsSgI/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	18	2026-06-01 00:25:39.775163
1654	17	xVe43QBvgiA	รวมเพลงสากลเก่าๆเพราะๆ สนุกๆ|| สากลยุค80-90|| Oldies Music	https://i.ytimg.com/vi/xVe43QBvgiA/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	19	2026-06-01 00:25:39.781538
1655	17	tIaraDoZdrg	รวมเพลงสากลเกาๆ รนเกาชอบฟง เพลงเกาทดทสด	https://i.ytimg.com/vi/tIaraDoZdrg/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	20	2026-06-01 00:25:39.78716
1656	17	Flyf4yTgTuw	รวมเพลงสากลเกาๆ รนเกาชอบฟง - Greatest Hits Golden Oldies 50s 60s 70s	https://i.ytimg.com/vi/Flyf4yTgTuw/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	21	2026-06-01 00:25:39.792983
1657	17	3K728NW6g_8	คัดเพลงเก่าๆดังๆฟังติดหูยุค80-90เพราะทุกเพลง🎧 Oldies Songs	https://i.ytimg.com/vi/3K728NW6g_8/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	22	2026-06-01 00:25:39.79875
1658	17	frUwE0jwabk	รวมเพลงสากลเก่าๆเพราะๆ สนุกๆ|| สากลยุค80-90	https://i.ytimg.com/vi/frUwE0jwabk/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	23	2026-06-01 00:25:39.805638
1659	17	j3xCKDwp0rs	รวมเพลงสากลเก่าๆ รุ่นเก๋าชอบฟัง | Greatest Hits Golden Oldies 50's ,60's & 70's	https://i.ytimg.com/vi/j3xCKDwp0rs/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	24	2026-06-01 00:25:39.811751
1660	17	PEZyosuM5as	สากลยุค80-90	https://i.ytimg.com/vi/PEZyosuM5as/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	25	2026-06-01 00:25:39.817892
1661	17	ZRaecX_Y6DI	รวมเพลงเก่า ๆฮิตยุค 80 90 ♨️ เพลงกันยาวๆคัดพิเศษ♥️ เพราะทุกเพลง🔥 Oldies Music	https://i.ytimg.com/vi/ZRaecX_Y6DI/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	26	2026-06-01 00:25:39.827225
1662	17	pZUv7TyCBls	เพลงดงในอดต เพลงสากลฟงสบาย เวลาฝนตก 2ชม - oldies music with rain	https://i.ytimg.com/vi/pZUv7TyCBls/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	27	2026-06-01 00:25:39.833276
1663	17	51BRzif1j-w	รวมเพลงสากลเกาๆ รนเกาชอบฟง-  Greatest Hits Golden Oldies 50s 60s  70s	https://i.ytimg.com/vi/51BRzif1j-w/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	28	2026-06-01 00:25:39.839301
1664	17	1z_yDA5XgSU	รวมเพลงสากลเก่าๆ รุ่นเก๋าชอบฟัง	https://i.ytimg.com/vi/1z_yDA5XgSU/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	29	2026-06-01 00:25:39.844984
1757	19	pV10xYc45ds	Cody Johnson - Travelin' Soldier (Studio Visualizer)	https://i.ytimg.com/vi/pV10xYc45ds/mqdefault.jpg	\N	Cody Johnson	40	2026-06-01 00:26:26.064507
1665	17	cHK-wUj_FSs	รวมเพลงสากลเก่าๆ รุ่นเก๋าชอบฟัง|| เพลง สากล เก่า เพราะ ๆ|| Oldies Songs	https://i.ytimg.com/vi/cHK-wUj_FSs/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	30	2026-06-01 00:25:39.850654
1666	17	fxQKNwYRSeE	เพลงดงในอดตเ พลงสากลฟงสบาย เวลาฝนตก 1ชม oldies music with rainydayoldies songs collection	https://i.ytimg.com/vi/fxQKNwYRSeE/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	31	2026-06-01 00:25:39.856736
1667	17	KyH6VntrIlg	รวมเพลงสากลเก่าๆ รุ่นเก๋าชอบฟัง|| เพลงเก่าที่ดีที่สุด	https://i.ytimg.com/vi/KyH6VntrIlg/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	32	2026-06-01 00:25:39.863788
1668	17	YqulWgOgv4E	เพลงสากลดังในอดีต - oldies 50's 60's 70's  songs	https://i.ytimg.com/vi/YqulWgOgv4E/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	33	2026-06-01 00:25:39.87038
1669	17	m0THh92DEMw	รวมเพลงสากลเกาๆ รนเกาชอบฟง เพลงเกาทดทสด	https://i.ytimg.com/vi/m0THh92DEMw/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	34	2026-06-01 00:25:39.876459
1670	17	BYUtfmKkEaI	เพลงดงในอดต เพลงสากลฟงสบาย เวลาฝนตก 2ชม - oldies music with rainydayeasy listening oldies	https://i.ytimg.com/vi/BYUtfmKkEaI/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	35	2026-06-01 00:25:39.882512
1671	17	YsHrYCVVC0M	รวมเพลงสากลเกาๆ รนเกาชอบฟง เพลงเกาทดทสด	https://i.ytimg.com/vi/YsHrYCVVC0M/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	36	2026-06-01 00:25:39.888779
1672	17	ztlmtgq5uAk	รวมเพลงสากลเก่าๆเพราะๆ สนุกๆ|| สากลยุค80-90|| Oldies Music	https://i.ytimg.com/vi/ztlmtgq5uAk/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	37	2026-06-01 00:25:39.895091
1673	17	htKBMqkA1Y8	รวมเพลงสากลเกาๆ รนเกาชอบฟง -  Greatest Hits Golden Oldies 50s 60s  70s	https://i.ytimg.com/vi/htKBMqkA1Y8/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	38	2026-06-01 00:25:39.901132
1674	17	dAYqI71ucuI	เพลงดังในอดีต เพลงสากลฟังสบาย เวลาฝนตก 2ชม ( oldies music with rainyday,easy listening oldie songs)	https://i.ytimg.com/vi/dAYqI71ucuI/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	39	2026-06-01 00:25:39.906961
1675	17	iu9qEZUoX6c	รวมเพลงสากลเก่าๆ รุ่นเก๋าชอบฟัง|| เพลงเก่าที่ดีที่สุด - Oldies Music	https://i.ytimg.com/vi/iu9qEZUoX6c/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	40	2026-06-01 00:25:39.912894
1676	17	U3SszCbA_-I	รวมสากลเก่าๆ ยุค 70 โคตรเพราะ	https://i.ytimg.com/vi/U3SszCbA_-I/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	41	2026-06-01 00:25:39.91899
1677	17	JLa7LVtMW3c	รวมเพลงสากลเกาๆ รนเกาชอบฟง เพลง สากล เกา เพราะ ๆ - Oldies Songs	https://i.ytimg.com/vi/JLa7LVtMW3c/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	42	2026-06-01 00:25:39.925914
1678	17	k6MYLPAxPgg	รวมเพลงสากลเก่าๆเพราะๆ สนุกๆ|| สากลยุค80-90|| Oldies Music	https://i.ytimg.com/vi/k6MYLPAxPgg/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	43	2026-06-01 00:25:39.931662
1679	17	hIprY-ULzDk	รวมเพลงเก่า ! รวมเพลงสตริงยุค90เพราะๆ เพลงกันยาวๆคัดพิเศษ ♪ รวมเพลงเก่า ๆฮิตยุค90 โดนใจวัยเก๋า VL3	https://i.ytimg.com/vi/hIprY-ULzDk/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	44	2026-06-01 00:25:39.937475
1680	17	eALGAqUuBoY	รวมเพลงเก่า ! รวมเพลงสตริงยุค90เพราะๆ เพลงกันยาวๆคัดพิเศษ ♪ รวมเพลงเก่า ๆฮิตยุค90 โดนใจวัยเก๋า VL4	https://i.ytimg.com/vi/eALGAqUuBoY/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	45	2026-06-01 00:25:39.942794
1681	17	dhbdBu6GsI4	เพลงดังในอดีต เพลงสากลฟังสบาย เวลาฝนตก 2ชม ( oldies music with rainyday,easy listening oldie songs)	https://i.ytimg.com/vi/dhbdBu6GsI4/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	46	2026-06-01 00:25:39.948541
1682	17	uhkoYytGclM	รวมเพลงสากลเก่าๆเพราะๆ สนุกๆ|| สากลยุค80-90|| Oldies Music vol1	https://i.ytimg.com/vi/uhkoYytGclM/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	47	2026-06-01 00:25:39.954476
1683	17	OnDDkvgUSiU	รวมเพลงสากลเก่าๆเพราะๆ สนุกๆ|| สากลยุค80-90|| Oldies Music	https://i.ytimg.com/vi/OnDDkvgUSiU/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	48	2026-06-01 00:25:39.960064
1684	17	hy4Y4dKgdR8	รวมเพลงสากลเก่าๆเพราะๆ สนุกๆ|| สากลยุค80-90|| Oldies Music vol 4	https://i.ytimg.com/vi/hy4Y4dKgdR8/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	49	2026-06-01 00:25:39.965605
1685	17	nm60qFWrb70	รวมเพลงสากลเก่าๆเพราะๆ สนุกๆ|| สากลยุค80-90|| Oldies Music	https://i.ytimg.com/vi/nm60qFWrb70/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	50	2026-06-01 00:25:39.971695
1686	17	dCparBJAo_c	รวมเพลงสากลเก่าๆ รุ่นเก๋าชอบฟัง HD	https://i.ytimg.com/vi/dCparBJAo_c/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	51	2026-06-01 00:25:39.978052
1687	17	ZVAejJi-N-A	เพลงสากลเก่า บ้านก๋วยเตี๋ยว ซ. แจ้งวัฒนะปากเกร็ด10 จ. นนทบุรี	https://i.ytimg.com/vi/ZVAejJi-N-A/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	52	2026-06-01 00:25:39.98434
1688	17	WO5qCtwhVV4	เพลงสากลเก่า บ้านก๋วยเตี๋ยว ซ. แจ้งวัฒนะปากเกร็ด10 จ. นนทบุรี	https://i.ytimg.com/vi/WO5qCtwhVV4/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	53	2026-06-01 00:25:39.989803
1712	18	9U5tXgHBuKQ	รวมเพลงฝรั่งมาแรง YouTube ปี 2025	https://i.ytimg.com/vi/9U5tXgHBuKQ/mqdefault.jpg	\N	Feel Good Music	23	2026-06-01 00:25:48.547652
1689	17	A6vkh0QTepE	รวมเพลงสากลเก่าๆ รุ่นเก๋าชอบฟัง || Greatest Hits Golden Oldies 50's ,60's & 70's	https://i.ytimg.com/vi/A6vkh0QTepE/mqdefault.jpg	\N	เพลง สากล เก่า เพราะ ๆ	54	2026-06-01 00:25:39.995222
1690	18	ge9hb7_TPO0	รวมเพลงสากล2026 มาแรง 100ล้านวิว☕เพลงสากลฮิต2026 ฟังยาวๆ ไม่มีโฆษณาคั่น🎧Topt English Songs Playlist	https://i.ytimg.com/vi/ge9hb7_TPO0/mqdefault.jpg	\N	Feel Good Music	1	2026-06-01 00:25:48.428477
1691	18	ZTGNQLyCPc4	รวมเพลงสากล200 ล้านวิว มาแรง 🎶 เพลงสากลฟังสบาย ฟังเพลงออนไลน์ ตลอด 24 ชั่วโมง🎧🎶🎶🎶 #FeelGoodMusic	https://i.ytimg.com/vi/ZTGNQLyCPc4/mqdefault.jpg	\N	Feel Good Music	2	2026-06-01 00:25:48.434396
1692	18	MylxF9z45uU	รวมเพลงสากล 100 ล้านวิว มาแรง 🎧 เพลงสากลฮิต 2026 ฟังยาวๆ ไม่มีโฆษณาคั่น 🎶 New  English Songs 2026	https://i.ytimg.com/vi/MylxF9z45uU/mqdefault.jpg	\N	Feel Good Music	3	2026-06-01 00:25:48.439673
1693	18	SvrIenyKIoc	รวมเพลงเพราะๆ เพลงสากลฟังสบาย ฟังเพลงออนไลน์ ตลอด 24 ชั่วโมง🎧🎶🎶🎶 #FeelGoodMusic	https://i.ytimg.com/vi/SvrIenyKIoc/mqdefault.jpg	\N	Feel Good Music	4	2026-06-01 00:25:48.445684
1694	18	HLZerfnVu-A	รวมเพลงสากลเพราะที่สุด 2026 🔥🎶 เพลงฟังสบาย | English Chill Music	https://i.ytimg.com/vi/HLZerfnVu-A/mqdefault.jpg	\N	เพลงสากลฮิต24ชั่วโมง	5	2026-06-01 00:25:48.451113
1695	18	CtYsDU-H49E	รวมเพลงสากล 100 ล้านวิว ☕ gพลงสากลฮิต 2026 ฟังยาวๆ ไม่มีโฆษณาคั่น 🎧 Best English Songs Playlist 2026	https://i.ytimg.com/vi/CtYsDU-H49E/mqdefault.jpg	\N	Feel Good Music	6	2026-06-01 00:25:48.456343
1696	18	UwmltLGt2gQ	รวมเพลงสากล100ล้านวิว 🎙️ เพลงสากลเพราะๆ ฟังสบายๆ ฟังร้านกาแฟ #เพลงใหม่ล่าสุด #เพลงฮิต #เพลงสากล	https://i.ytimg.com/vi/UwmltLGt2gQ/mqdefault.jpg	\N	Feel Good Music	7	2026-06-01 00:25:48.461501
1697	18	v0vlNmD3OVA	เพลย์ลิสต์เพลงสากลยาวๆ สำหรับวันทำงาน 📻 รวมเพลงสากลติดหู ยาวๆ เพลง Party สากลเพราะๆ	https://i.ytimg.com/vi/v0vlNmD3OVA/mqdefault.jpg	\N	Feel Good Music	8	2026-06-01 00:25:48.466547
1698	18	aUeEZzhcE5E	รวมเพลงใหม่ 2025 ฟังแล้วติดหูเพลงสากลเปิดตัวแรง 2025 🎧 อัปเดตเพลงสากลใหม่ประจำเดือน 2025	https://i.ytimg.com/vi/aUeEZzhcE5E/mqdefault.jpg	\N	Feel Good Music	9	2026-06-01 00:25:48.471674
1699	18	34y5GduHTb0	20 เพลงสากลเพราะๆ ✅ เพลงใหม่ฝรั่ง 2025 รวมฮิตมาแล้ว 🎧 เพลงฮิตสากล 2025 อัปเดตล่าสุด	https://i.ytimg.com/vi/34y5GduHTb0/mqdefault.jpg	\N	Feel Good Music	10	2026-06-01 00:25:48.4765
1700	18	NnNAc2MWHM4	English Road Trip Songs 🚗 เพลงฟังบนทางไกล	https://i.ytimg.com/vi/NnNAc2MWHM4/mqdefault.jpg	\N	Feel Good Music	11	2026-06-01 00:25:48.481848
1701	18	CIiBJGzpfOc	ฟังเพลงสากลเปิดร้านกาแฟ ✅ รวมเพลงสากลเพราะๆ ฟังต่อเนื่องไม่มีสะดุด  เพลงสากลใหม่ล่าสุด 2025 🎶 ✅	https://i.ytimg.com/vi/CIiBJGzpfOc/mqdefault.jpg	\N	Feel Good Music	12	2026-06-01 00:25:48.487457
1702	18	0P8Zaa8x-bU	รวมเพลงสากลฟีลดี 2025 😎 Positive Vibes Only เพลงฮิตต่างประเทศ 2025 🌎 อัปเดตใหม่!	https://i.ytimg.com/vi/0P8Zaa8x-bU/mqdefault.jpg	\N	Feel Good Music	13	2026-06-01 00:25:48.493342
1703	18	oyogxDlaVdM	รวมเพลงฮิตสากลเปิดทุกที่ในปี 2025 🎧 เพลงสากลชิลล์ๆ เพลงสากลเพราะๆ ฟังสบาย เปิดได้ทั้งวัน #เพลงเพราะ	https://i.ytimg.com/vi/oyogxDlaVdM/mqdefault.jpg	\N	Feel Good Music	14	2026-06-01 00:25:48.498553
1704	18	WkBtLBEZ3OU	Chill Drive Playlist – สากลเพราะๆ 🚗 เพลงสากลเพราะๆ 2025 ฟังสบาย	https://i.ytimg.com/vi/WkBtLBEZ3OU/mqdefault.jpg	\N	Feel Good Music	15	2026-06-01 00:25:48.504641
1705	18	IeTkvjx1B-0	รวมเพลงสากลติดหู ยาวๆ 💕 เพลงสากลเพราะๆ 2025 ฟังสบาย 🎧 เพลงใหม่มาแรงบน Spotify ปี 2025	https://i.ytimg.com/vi/IeTkvjx1B-0/mqdefault.jpg	\N	Feel Good Music	16	2026-06-01 00:25:48.509911
1706	18	nRR4QRHXLtA	ฟังแล้วติดใจ เพลงสากล 2025 💫 รวมเพลงสากลไม่มีโฆษณา ⛔️ ฟังยาวไม่มีขัดจังหวะ - เพลงเพราะ ต่อเนื่อง	https://i.ytimg.com/vi/nRR4QRHXLtA/mqdefault.jpg	\N	Feel Good Music	17	2026-06-01 00:25:48.515502
1707	18	5Q_z3M8FqSQ	รวมเพลงสากลฮิต 2025 ฟังเพลงต่อเนื่อง 🎼 เพลงสากลสายชิล ฟังเพลงเพราะที่ทุกคนชอบ ☀️ เปิดได้ทั้งวัน	https://i.ytimg.com/vi/5Q_z3M8FqSQ/mqdefault.jpg	\N	Feel Good Music	18	2026-06-01 00:25:48.520398
1708	18	oAp0i611mPw	รวมเพลงสากลชิลล์ๆ ปี 2025 เพลงสากลเพราะๆ 2025 ฟังสบาย 💫 เพลงใหม่ฝรั่ง 2025 รวมฮิตมาแล้ว	https://i.ytimg.com/vi/oAp0i611mPw/mqdefault.jpg	\N	Feel Good Music	19	2026-06-01 00:25:48.525784
1709	18	L9su1h5odu0	รวมเพลงฝรั่งเพราะๆ 2025 💖 ฟังได้ทั้งวัน  Chill Pop 2025 💫 เพลงสากลฟังสบายในวันสบายๆ	https://i.ytimg.com/vi/L9su1h5odu0/mqdefault.jpg	\N	Feel Good Music	20	2026-06-01 00:25:48.530784
1710	18	C_Uf5zfHxG8	รวมเพลงฮิตต่างประเทศ เพลงสากลฮิตติดชาร์ต ✅ เพลงใหม่มาแรงปี 2025 🎶 Top Music Compilation	https://i.ytimg.com/vi/C_Uf5zfHxG8/mqdefault.jpg	\N	Feel Good Music	21	2026-06-01 00:25:48.536392
1711	18	tIHXKKDHJXA	รวมเพลงสากลฮิต เปิดวนได้ทั้งวัน 🔂 เพลงฝรั่งป๊อป 2025 🎶 Pop Hits ที่ห้ามพลาด	https://i.ytimg.com/vi/tIHXKKDHJXA/mqdefault.jpg	\N	Feel Good Music	22	2026-06-01 00:25:48.542057
1713	18	uRQfszOY8kE	รวมเพลงสากลเพราะๆ 2025 ฟังสบาย 📈 เพลงยอดนิยม – ฟังวนทั้งปี 🔥 เพลงสากลฮิต 2025 – รวมเพลงดัง #music	https://i.ytimg.com/vi/uRQfszOY8kE/mqdefault.jpg	\N	Feel Good Music	24	2026-06-01 00:25:48.55374
1714	18	tZ4gqU0OlJw	รวมเพลงฝรั่งเพราะๆ 2025 💖 ฟังได้ทั้งวัน English Road Trip Songs 🚗 เพลงฟังบนทางไกล	https://i.ytimg.com/vi/tZ4gqU0OlJw/mqdefault.jpg	\N	Feel Good Music	25	2026-06-01 00:25:48.558858
1715	18	yyXoDy-tr-Q	🎧 รวมเพลงสากลเพราะๆ ฟังต่อเนื่องไม่มีสะดุด เพลงฝรั่งยอดฮิตตลอดกาลและเพลงใหม่มาแรงปี 2025 🎶	https://i.ytimg.com/vi/yyXoDy-tr-Q/mqdefault.jpg	\N	Feel Good Music	26	2026-06-01 00:25:48.566666
1716	18	t1NAciOiCUY	รวมพลงสากลเพราะๆ 2025 ฟังสบาย 💫 เพลงสากลชิลล์ๆ  Chill Drive Playlist – สากลเพราะๆ #เพลงเพราะ #music	https://i.ytimg.com/vi/t1NAciOiCUY/mqdefault.jpg	\N	Feel Good Music	27	2026-06-01 00:25:48.571866
1717	18	_rkrBau-hgc	รวมเพลงสากลมาแรง 2025 ห้ามพลาด! 🔥 เพลงฮิตสากล 2025 อัปเดตล่าสุด 🔥 เพลงใหม่สากล 2025 ฟังเพลินๆ	https://i.ytimg.com/vi/_rkrBau-hgc/mqdefault.jpg	\N	Feel Good Music	28	2026-06-01 00:25:48.577323
1718	19	hLOheGDwD_0	Ella Langley - Choosin' Texas (Official Lyric Video)	https://i.ytimg.com/vi/hLOheGDwD_0/mqdefault.jpg	\N	EllaLangleyVEVO	1	2026-06-01 00:26:25.803598
1719	19	hwUixddbmrQ	Morgan Wallen - I Got Better (Official Music Video)	https://i.ytimg.com/vi/hwUixddbmrQ/mqdefault.jpg	\N	MorganWallenVEVO	2	2026-06-01 00:26:25.810358
1720	19	pocGpyM3YCg	Vincent Mason - Don’t Ask Me (Official Visualizer)	https://i.ytimg.com/vi/pocGpyM3YCg/mqdefault.jpg	\N	VincentMasonVEVO	3	2026-06-01 00:26:25.816536
1721	19	Dg47eNL_Usw	Ella Langley - Be Her (Official Video)	https://i.ytimg.com/vi/Dg47eNL_Usw/mqdefault.jpg	\N	EllaLangleyVEVO	4	2026-06-01 00:26:25.833461
1722	19	wIA-4LeRgsc	Morgan Wallen - I’m The Problem (Lyric Video)	https://i.ytimg.com/vi/wIA-4LeRgsc/mqdefault.jpg	\N	Morgan Wallen	5	2026-06-01 00:26:25.839533
1723	19	sf6eRmInk1s	Ella Langley - Dandelion (Official Visualizer)	https://i.ytimg.com/vi/sf6eRmInk1s/mqdefault.jpg	\N	EllaLangleyVEVO	6	2026-06-01 00:26:25.845575
1724	19	hNrwlzBeFN8	Morgan Wallen - What I Want (feat. Tate McRae) (Lyric Video)	https://i.ytimg.com/vi/hNrwlzBeFN8/mqdefault.jpg	\N	Morgan Wallen	7	2026-06-01 00:26:25.851671
1725	19	f1WZQAdFd4I	Vincent Mason - Damned If I Do (Official Visualizer)	https://i.ytimg.com/vi/f1WZQAdFd4I/mqdefault.jpg	\N	Vincent Mason	8	2026-06-01 00:26:25.857191
1726	19	iw9wcJ7RZzY	Morgan Wallen - Just In Case (Lyric Video)	https://i.ytimg.com/vi/iw9wcJ7RZzY/mqdefault.jpg	\N	Morgan Wallen	9	2026-06-01 00:26:25.863568
1727	19	ejcQvdbRT9A	Dax - "Caught You In The Bed" (Official Music Video)	https://i.ytimg.com/vi/ejcQvdbRT9A/mqdefault.jpg	\N	Dax	10	2026-06-01 00:26:25.869573
1728	19	qCbFhjLU-aM	Luke Combs - Sleepless in a Hotel Room (Official Studio Video)	https://i.ytimg.com/vi/qCbFhjLU-aM/mqdefault.jpg	\N	LukeCombsVEVO	11	2026-06-01 00:26:25.876207
1729	19	pCv0oP9JLKw	Morgan Wallen - 20 Cigarettes (Official Music Video)	https://i.ytimg.com/vi/pCv0oP9JLKw/mqdefault.jpg	\N	MorganWallenVEVO	12	2026-06-01 00:26:25.882008
1730	19	XqU8W23E4-I	The Red Clay Strays - If I Didn't Know You (Official Video)	https://i.ytimg.com/vi/XqU8W23E4-I/mqdefault.jpg	\N	TheRedClayStraysVEVO	13	2026-06-01 00:26:25.889497
1731	19	F7KdQ8CTe5E	Morgan Wallen - Smile (Official Music Video)	https://i.ytimg.com/vi/F7KdQ8CTe5E/mqdefault.jpg	\N	MorganWallenVEVO	14	2026-06-01 00:26:25.896148
1732	19	kTdIrRPRKXM	Waylon Wyatt - Dead Man Walkin' (Official Music Video)	https://i.ytimg.com/vi/kTdIrRPRKXM/mqdefault.jpg	\N	WaylonWyattVEVO	15	2026-06-01 00:26:25.902709
1733	19	x10Eo-yoLTA	Luke Combs - Be By You (Official Lyric Video)	https://i.ytimg.com/vi/x10Eo-yoLTA/mqdefault.jpg	\N	LukeCombsVEVO	16	2026-06-01 00:26:25.910648
1734	19	BcCCBNoDVwk	Morgan Wallen - I'm A Little Crazy (Lyric Video)	https://i.ytimg.com/vi/BcCCBNoDVwk/mqdefault.jpg	\N	Morgan Wallen	17	2026-06-01 00:26:25.916262
1735	19	GNha6HdPYOc	Superman	https://i.ytimg.com/vi/GNha6HdPYOc/mqdefault.jpg	\N	Morgan Wallen - Topic	18	2026-06-01 00:26:25.92184
1736	19	ko5dkIVIUWc	Heartless (Wallen Album Mix)	https://i.ytimg.com/vi/ko5dkIVIUWc/mqdefault.jpg	\N	Morgan Wallen - Topic	19	2026-06-01 00:26:25.927616
1737	19	AIPzbeQMn9Y	Shaboozey, Jelly Roll - Amen (Visualizer)	https://i.ytimg.com/vi/AIPzbeQMn9Y/mqdefault.jpg	\N	ShaboozeyVEVO	20	2026-06-01 00:26:25.933435
1738	19	dnCwYP-0YxA	Gloria Anderson - Highway 80 | Official Visualizer	https://i.ytimg.com/vi/dnCwYP-0YxA/mqdefault.jpg	\N	GloriaAndersonVEVO	21	2026-06-01 00:26:25.93946
1739	19	1Zm9tnMvFJk	Can't You See	https://i.ytimg.com/vi/1Zm9tnMvFJk/mqdefault.jpg	\N	The Marshall Tucker Band - Topic	22	2026-06-01 00:26:25.949689
1740	19	MBWmVXzGdVs	Zach Bryan - Plastic Cigarette	https://i.ytimg.com/vi/MBWmVXzGdVs/mqdefault.jpg	\N	Zach Bryan	23	2026-06-01 00:26:25.956071
1741	19	QA2vzqQ_CG8	Shaboozey - Born To Die (Official Video)	https://i.ytimg.com/vi/QA2vzqQ_CG8/mqdefault.jpg	\N	ShaboozeyVEVO	24	2026-06-01 00:26:25.961917
1742	19	j7vlkVzgBg4	Pink Skies (feat. Watchhouse)	https://i.ytimg.com/vi/j7vlkVzgBg4/mqdefault.jpg	\N	Zach Bryan - Topic	25	2026-06-01 00:26:25.970554
1743	19	uGsmAZCwrG8	Luke Combs - Days Like These (Official Studio Video)	https://i.ytimg.com/vi/uGsmAZCwrG8/mqdefault.jpg	\N	LukeCombsVEVO	26	2026-06-01 00:26:25.976974
1744	19	NlohfwTunwU	Kacey Musgraves - Dry Spell (Official Music Video)	https://i.ytimg.com/vi/NlohfwTunwU/mqdefault.jpg	\N	KaceyMusgravesVEVO	27	2026-06-01 00:26:25.983088
1745	19	tUZNPJ9VzKM	Ain’t That Some	https://i.ytimg.com/vi/tUZNPJ9VzKM/mqdefault.jpg	\N	Morgan Wallen - Topic	28	2026-06-01 00:26:25.990054
1746	19	_ESgWfd_5uI	Carson Beyer - Match Made / The Flame (Visualizer)	https://i.ytimg.com/vi/_ESgWfd_5uI/mqdefault.jpg	\N	Carson Beyer	29	2026-06-01 00:26:25.996555
1747	19	dQmO2ZGK5nM	Gavin Adcock - Last One To Know (Official Music Video)	https://i.ytimg.com/vi/dQmO2ZGK5nM/mqdefault.jpg	\N	Gavin Adcock	30	2026-06-01 00:26:26.002021
1748	19	t1VEacIljgs	Ty Myers - Thought It Was Love (Official Audio)	https://i.ytimg.com/vi/t1VEacIljgs/mqdefault.jpg	\N	TyMyersVEVO	31	2026-06-01 00:26:26.008082
1749	19	tW8F8JCn6UQ	HARDY, Eric Church, Morgan Wallen, Tim McGraw - McArthur (Lyric Video)	https://i.ytimg.com/vi/tW8F8JCn6UQ/mqdefault.jpg	\N	HARDY	32	2026-06-01 00:26:26.013875
1750	19	A3G_7XgK2B4	Ella Langley & Morgan Wallen - I Can’t Love You Anymore (Official Lyric Video)	https://i.ytimg.com/vi/A3G_7XgK2B4/mqdefault.jpg	\N	Ella Langley	33	2026-06-01 00:26:26.020176
1751	19	llxXrn77Yjc	ABSquared, Brian Maloney - Dancing With You	https://i.ytimg.com/vi/llxXrn77Yjc/mqdefault.jpg	\N	ABSquaredVEVO	34	2026-06-01 00:26:26.025889
\.


--
-- Data for Name: playlists; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.playlists (id, name, description, is_default, created_at, updated_at, is_enabled) FROM stdin;
8	Coffee Jazz | เพลงบรรเลงร้านกาแฟ ฟังสบาย สไตล์แจ๊ส	Imported from YouTube playlist: PLfr-LImXrncRGYMUAXDawefGkRufo-QkD	f	2026-05-09 17:58:05.690028	2026-05-30 05:26:37.852731	t
11	เพลงไทยร้านนั่งชิวๆ😊✌️	Imported from YouTube playlist: PLr0r4BJEJ_-dH9YTip8Zk3jnXTpPIgB9P	f	2026-05-29 02:37:27.564774	2026-06-01 00:24:08.773422	t
7	เพลงตั้งแคมป์	Imported from YouTube playlist: PLc8RFkjU_SyTGXkL2TA6EUdXQf4Nsc5Dv	f	2026-05-09 17:55:54.521134	2026-05-11 08:14:50.222934	t
1	Default Playlist	รายการเพลงหลักของร้าน	f	2026-05-09 06:09:08.820533	2026-05-09 08:56:29.396852	t
9	playlist  เหล้าไม่ถึงอย่าเปิดฟัง🍺🍺🍺	Imported from YouTube playlist: PL2OeFbE1-Z-ESTsJY9sG_aNYLfnUL7Ong	f	2026-05-10 12:31:54.666013	2026-05-30 08:26:05.066377	t
17	เพลงดังในอดีต เพลงสากลฟังสบาย เวลาฝนตก 2ชม ( oldies music with rainyday,easy listening oldie songs)	Imported from YouTube playlist: PL9hjA5NASMALkv2-R4Y9kANB-STjGAgMp	f	2026-06-01 00:25:39.643015	2026-06-01 00:25:39.643015	t
2	เพลงยุค 2000 ช้าๆ เพราะๆ​ (Pop​ of 2000s)	Imported from YouTube playlist: PLcu5tjBeUT1gzNiD_d0SsYpAt6KDl4vF7	f	2026-05-09 08:23:44.624293	2026-05-09 11:45:07.898149	t
6	รวมเพลงท่องเที่ยวธรรมชาติ Camping	Imported from YouTube playlist: PL2RfZcsp-QDLEx8zVBnQ2QN7I4k42SHWL	f	2026-05-09 17:55:29.943111	2026-05-16 01:46:26.445618	t
18	TOP 20 เพลงสากลฮิตที่สุด 2025 รวมเพลงฮิตสากลเปิดทุกที่ในปี 2025	Imported from YouTube playlist: PLun6RQZlQWPzTpnpEzFk6Y9WK_yTgivfu	f	2026-06-01 00:25:48.413843	2026-06-01 00:25:48.413843	t
14	Good Morning Music | ดนตรีบรรเลงสบายๆ ฟังยามเช้า	Imported from YouTube playlist: PLfr-LImXrncQXJqpyXDVR9Cd-9x6EYtn2	f	2026-05-29 02:38:18.754691	2026-06-01 00:24:18.42168	t
19	Country Music Playlist 2026 ♫ Top Country Songs of 2026 (Best Country Hits)	Imported from YouTube playlist: PL3oW2tjiIxvRDymF6SFf7t4xfDbtRQxlt	t	2026-06-01 00:26:25.788464	2026-06-01 00:26:30.897582	t
10	เพลงเพราะๆจากร้าน Chill	Imported from YouTube playlist: PLqbhJj_2dvzTjXrgGC4htC5exzTWClR0B	f	2026-05-29 02:37:26.344896	2026-05-29 02:37:26.344896	t
12	Coffee Jazz | เพลงบรรเลงร้านกาแฟ ฟังสบาย สไตล์แจ๊ส	Imported from YouTube playlist: PLfr-LImXrncRGYMUAXDawefGkRufo-QkD	f	2026-05-29 02:37:43.407791	2026-05-29 02:37:43.407791	t
5	90ไทยมันๆ ป๊อปร็อค(ร้านเหล้า)	Imported from YouTube playlist: PL-qNXt2kqLf9UuLVkryP0LZQH8QFfQlh-	f	2026-05-09 12:19:40.012366	2026-05-10 11:20:57.322034	t
15	เตรียมร็อกริมทะเล 🤘🏻🌴	Imported from YouTube playlist: PL0X-JpLCn4aOQwLiNG873idhCYOc9tPfx	f	2026-05-30 04:08:34.912637	2026-05-30 10:10:12.141903	t
16	「รวมเพลงเพื่อชีวิตฟังยาวๆ」	Imported from YouTube playlist: PL69S13uh_sBBqMNdiF5K1fjPs3D3LuBI0	f	2026-05-30 10:09:01.788721	2026-05-30 10:10:15.016444	t
4	ร้านเหล้าดึกคึกคัก	Imported from YouTube playlist: PL2dbNz54X_2kqIhz2ukVvbcXAysQ_xiOO	f	2026-05-09 12:19:30.875287	2026-05-31 03:23:00.957867	t
13	รวมเพลงเพราะๆ ฟังสบายๆ CHILL &amp; CAFÉ	Imported from YouTube playlist: PLfvoLC68l41neiPYXGcX419fjBoaIM1Zv	f	2026-05-29 02:37:47.713337	2026-05-31 09:35:27.73246	t
\.


--
-- Data for Name: song_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.song_requests (id, youtube_id, title, thumbnail, duration, requested_by, status, played_at, created_at, device_id) FROM stdin;
1	SXy-v1KbF4k	ฝนตกที่หน้าต่าง - LOSO 【OFFICIAL MV】	https://i.ytimg.com/vi/SXy-v1KbF4k/mqdefault.jpg	\N	ลูกค้า	played	2026-05-09 08:40:34.876776	2026-05-09 08:29:38.489939	dev_1feg1czv_moy31ic8
13	8NkHAzmpGmo	ด้วยรักและปลาทู - มอส ปฏิภาณ  【OFFICIAL MV】	https://i.ytimg.com/vi/8NkHAzmpGmo/mqdefault.jpg	\N	ลูกค้า	played	2026-05-12 03:49:03.677491	2026-05-12 03:44:01.983515	dev_vqmayljv_moy83k8d
3	Z-qjxO_ZJKM	สิ่งของ - KLEAR「Official MV」	https://i.ytimg.com/vi/Z-qjxO_ZJKM/mqdefault.jpg	\N	Nu	skipped	\N	2026-05-09 10:54:52.219438	dev_vqmayljv_moy83k8d
4	v0UvOsCi8mc	ไม่เคย - 25hours「Official MV」	https://i.ytimg.com/vi/v0UvOsCi8mc/mqdefault.jpg	\N	Nu	skipped	\N	2026-05-09 10:57:59.249192	dev_vqmayljv_moy83k8d
5	5SZByn3eik0	ยินดีที่ไม่รู้จัก...	https://i.ytimg.com/vi/5SZByn3eik0/mqdefault.jpg	\N	Nu	skipped	\N	2026-05-09 10:58:07.497962	dev_vqmayljv_moy83k8d
2	x7R1FpIdbXE	น้ำเต็มแก้ว - Endorphine【OFFICIAL MV】	https://i.ytimg.com/vi/x7R1FpIdbXE/mqdefault.jpg	\N	ลูกค้า	played	2026-05-09 11:18:24.029033	2026-05-09 10:52:07.227811	dev_vqmayljv_moy83k8d
6	n7Vkaxa26cA	อู้บ่จ้าง - บี้ สุกฤษฎิ์ (BIE SUKRIT) | Lyric Video 🐓⚡️	https://i.ytimg.com/vi/n7Vkaxa26cA/mqdefault.jpg	\N	ลูกค้า	skipped	\N	2026-05-09 11:01:08.653699	dev_y8l3356y_moy8gl65
7	Gy-MZjiFv2M	ดอกกระเจียวบาน - ก้อง ห้วยไร่ |Official MV|	https://i.ytimg.com/vi/Gy-MZjiFv2M/mqdefault.jpg	\N	Nu	played	2026-05-09 11:42:06.767536	2026-05-09 11:14:56.853133	dev_vqmayljv_moy83k8d
8	8ONLsKcc294	Violette Wautier - wanna be yours (อยากให้เธอรัก) | OFFICIAL MV	https://i.ytimg.com/vi/8ONLsKcc294/mqdefault.jpg	\N	ลูกค้า	played	2026-05-10 10:42:51.421265	2026-05-10 10:38:49.145083	dev_vqmayljv_moy83k8d
9	Gy-MZjiFv2M	ดอกกระเจียวบาน - ก้อง ห้วยไร่ |Official MV|	https://i.ytimg.com/vi/Gy-MZjiFv2M/mqdefault.jpg	\N	ลูกค้า	played	2026-05-10 10:47:09.503349	2026-05-10 10:39:45.682317	dev_vqmayljv_moy83k8d
10	n7Vkaxa26cA	อู้บ่จ้าง - บี้ สุกฤษฎิ์ (BIE SUKRIT) | Lyric Video 🐓⚡️	https://i.ytimg.com/vi/n7Vkaxa26cA/mqdefault.jpg	\N	ลูกค้า	played	2026-05-10 10:54:05.078466	2026-05-10 10:40:20.975149	dev_vqmayljv_moy83k8d
11	z3jJNe-ssFY	คิดถึง - SILLY FOOLS 【OFFICIAL MV】	https://i.ytimg.com/vi/z3jJNe-ssFY/mqdefault.jpg	\N	ลูกค้า	played	2026-05-10 10:59:02.062365	2026-05-10 10:41:22.267647	dev_vqmayljv_moy83k8d
12	Gy-MZjiFv2M	ดอกกระเจียวบาน - ก้อง ห้วยไร่ |Official MV|	https://i.ytimg.com/vi/Gy-MZjiFv2M/mqdefault.jpg	\N	ลูกค้า	played	2026-05-10 12:41:43.536275	2026-05-10 12:35:02.809839	dev_ecaoeqf9_mozr84xc
\.


--
-- Name: app_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.app_settings_id_seq', 35, true);


--
-- Name: playlist_songs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.playlist_songs_id_seq', 1797, true);


--
-- Name: playlists_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.playlists_id_seq', 19, true);


--
-- Name: song_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.song_requests_id_seq', 13, true);


--
-- Name: active_players active_players_device_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_players
    ADD CONSTRAINT active_players_device_id_key UNIQUE (device_id);


--
-- Name: active_players active_players_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_players
    ADD CONSTRAINT active_players_pkey PRIMARY KEY (id);


--
-- Name: app_settings app_settings_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_settings
    ADD CONSTRAINT app_settings_key_key UNIQUE (key);


--
-- Name: app_settings app_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_settings
    ADD CONSTRAINT app_settings_pkey PRIMARY KEY (id);


--
-- Name: playlist_songs playlist_songs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.playlist_songs
    ADD CONSTRAINT playlist_songs_pkey PRIMARY KEY (id);


--
-- Name: playlists playlists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.playlists
    ADD CONSTRAINT playlists_pkey PRIMARY KEY (id);


--
-- Name: song_requests song_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.song_requests
    ADD CONSTRAINT song_requests_pkey PRIMARY KEY (id);


--
-- Name: active_players_status_ping_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX active_players_status_ping_idx ON public.active_players USING btree (is_active DESC, last_ping DESC);


--
-- Name: playlist_songs_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX playlist_songs_order_idx ON public.playlist_songs USING btree (playlist_id, "position", created_at);


--
-- Name: playlist_songs_playlist_youtube_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX playlist_songs_playlist_youtube_idx ON public.playlist_songs USING btree (playlist_id, youtube_id);


--
-- Name: playlists_single_default_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX playlists_single_default_idx ON public.playlists USING btree (is_default) WHERE (is_default = true);


--
-- Name: song_requests_pending_queue_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX song_requests_pending_queue_idx ON public.song_requests USING btree (created_at) WHERE ((status)::text = 'pending'::text);


--
-- Name: playlist_songs playlist_songs_playlist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.playlist_songs
    ADD CONSTRAINT playlist_songs_playlist_id_fkey FOREIGN KEY (playlist_id) REFERENCES public.playlists(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

