-- -------------------------------------------------------------
-- TablePlus 5.9.8(548)
--
-- https://tableplus.com/
--
-- Database: gigbase
-- Generation Time: 2024-05-02 10:56:24.6140
-- -------------------------------------------------------------


-- This script only contains the table creation statements and does not fully represent the table in the database. Do not use it as a backup.

-- Table Definition
CREATE TABLE "public"."artist_details" (
    "user_id" int4 NOT NULL,
    "band_name" varchar(255),
    "genre" varchar(100),
    "bio" text,
    PRIMARY KEY ("user_id")
);

-- This script only contains the table creation statements and does not fully represent the table in the database. Do not use it as a backup.

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS chat_messages_id_seq;

-- Table Definition
CREATE TABLE "public"."chat_messages" (
    "id" int4 NOT NULL DEFAULT nextval('chat_messages_id_seq'::regclass),
    "sender_id" int4 NOT NULL,
    "recipient_id" int4 NOT NULL,
    "message" text NOT NULL,
    "sent_at" timestamptz DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id")
);

-- This script only contains the table creation statements and does not fully represent the table in the database. Do not use it as a backup.

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS gigs_id_seq;

-- Table Definition
CREATE TABLE "public"."gigs" (
    "id" int4 NOT NULL DEFAULT nextval('gigs_id_seq'::regclass),
    "user_id" int4 NOT NULL,
    "venue_name" varchar(255),
    "title" varchar(255) NOT NULL,
    "description" text NOT NULL,
    "date" date NOT NULL,
    "pay" numeric NOT NULL,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now(),
    "time" time,
    "accepted_by" varchar(255),
    "offered_to" varchar(255),
    PRIMARY KEY ("id")
);

-- This script only contains the table creation statements and does not fully represent the table in the database. Do not use it as a backup.

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS reviews_id_seq;

-- Table Definition
CREATE TABLE "public"."reviews" (
    "id" int4 NOT NULL DEFAULT nextval('reviews_id_seq'::regclass),
    "reviewer_id" int4,
    "reviewee_id" int4,
    "content" text,
    "created_at" timestamptz DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id")
);

-- This script only contains the table creation statements and does not fully represent the table in the database. Do not use it as a backup.

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS users_id_seq;
DROP TYPE IF EXISTS "public"."user_role";
CREATE TYPE "public"."user_role" AS ENUM ('artist', 'venue');

-- Table Definition
CREATE TABLE "public"."users" (
    "id" int4 NOT NULL DEFAULT nextval('users_id_seq'::regclass),
    "username" varchar(255) NOT NULL,
    "password" varchar(255) NOT NULL,
    "role" "public"."user_role" NOT NULL,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id")
);

-- This script only contains the table creation statements and does not fully represent the table in the database. Do not use it as a backup.

-- Table Definition
CREATE TABLE "public"."venue_details" (
    "user_id" int4 NOT NULL,
    "venue_name" varchar(255),
    "address" text,
    "bio" text,
    PRIMARY KEY ("user_id")
);

INSERT INTO "public"."artist_details" ("user_id", "band_name", "genre", "bio") VALUES
(51, 'I.C.B.M', 'Classic Rock', ' ICBM (Intercontinental Ballistic Missile) is a rock band from Singapore that channels the music from the atomic era, with a focus on the dramatic period from WWII to the Cold War. Comprising members James, Anthony, Rizwan, and Rachel, their music blends original compositions and classic covers, evoking the intense emotions of the nuclear age. Known for their dynamic live shows featuring period visuals, ICBM offers both entertainment and a vivid throwback to a pivotal time in history.'),
(63, 'Riff-Raffs', 'Garage Rock', 'The Riff-Raffs are a garage rock band hailing from the lively streets of Singapore. Composed of vocalist Liam Ng, guitarist Vanessa Lee, bassist Darren Sim, and drummer Rachel Koh, this quartet is renowned for their raw, energetic sound and gritty performances. Their music draws heavily from 60s and 70s rock influences, updated with a modern edge and rebellious spirit. Known for their spontaneous and sometimes chaotic live shows, The Riff-Raffs have carved out a niche among fans of authentic, unpolished rock music.'),
(64, 'Bombay Royale', 'World Fusion/Indie Pop', 'Bombay Royale is a world fusion indie band from Singapore, blending South Asian classical music with modern pop sensibilities. The group consists of lead vocalist Sunita Raman, guitarist and sitar player Arjun Patel, bassist Neel Bhatia, and percussionist Amir Hussain. Their sound is a rich tapestry of vibrant rhythms, lush melodies, and an eclectic mix of instruments like tabla, sitar, and electric guitar. Bombay Royale''s music is an exploration of cultural heritage through the lens of contemporary life, bringing a fresh perspective to the global music scene. Their live performances are a colorful celebration of diversity, often accompanied by dancers and visual artists, making their shows a compelling experience that captivates audiences around the world.');

INSERT INTO "public"."gigs" ("id", "user_id", "venue_name", "title", "description", "date", "pay", "created_at", "updated_at", "time", "accepted_by", "offered_to") VALUES
(67, 53, 'Gigout', 'Electric Night', ' We''re inviting bands and DJs who specialize in electronic and synthpop music', '2024-08-19', 1200, '2024-04-29 10:12:42.538774', '2024-04-29 10:12:42.538774', '22:00:00', 'I.C.B.M', 'I.C.B.M'),
(69, 53, 'Gigout', 'Rock Through The Ages', 'This gig calls for bands that can play songs from different eras.', '2024-08-06', 1000, '2024-04-29 10:14:17.392326', '2024-04-29 10:14:17.392326', '21:00:00', NULL, 'I.C.B.M'),
(76, 53, 'Gigout', 'Acoustic Night', 'Looking for bands interest to play a simple acoustic gig', '2024-08-31', 1000, '2024-04-29 21:25:09.829975', '2024-04-29 21:25:09.829975', '21:00:00', 'I.C.B.M', 'I.C.B.M'),
(79, 61, 'The Grotto', 'Cave Rhythms', 'Need bands with a deep, resonant sound. For groups with strong presence and bass-heavy tunes', '2024-05-16', 1200, '2024-05-02 09:37:28.822772', '2024-05-02 09:37:28.822772', '21:00:00', NULL, NULL),
(80, 61, 'The Grotto', 'Underground Unplugged', 'Acoustic artists and duos, here''s your chance to echo through the chambers of The Grotto. ', '2024-05-25', 700, '2024-05-02 09:38:06.740384', '2024-05-02 09:38:06.740384', '21:00:00', NULL, NULL),
(82, 62, 'Skyline Bar', 'Jazz Under the Stars', 'We seek performers who can deliver smooth, classic jazz tunes', '2024-05-24', 1500, '2024-05-02 10:00:31.526558', '2024-05-02 10:00:31.526558', '21:00:00', NULL, NULL),
(83, 62, 'Skyline Bar', 'Skyline Serenades', 'Vocalists and pop ensembles, here’s your stage to shine against the backdrop of Singapore’s skyline. ', '2024-06-20', 1800, '2024-05-02 10:01:26.837577', '2024-05-02 10:01:26.837577', '21:00:00', NULL, NULL);

INSERT INTO "public"."reviews" ("id", "reviewer_id", "reviewee_id", "content", "created_at") VALUES
(21, 51, 53, 'Great venue, great sound system', '2024-04-30 13:04:31.674238+08'),
(22, 53, 51, 'Great talent, love the guitar solos and the vibes they bring to the gig!', '2024-04-30 13:05:00.140169+08');

INSERT INTO "public"."users" ("id", "username", "password", "role", "created_at") VALUES
(51, 'icbm', '$2a$10$wvz8D2gDPj4JQKZAZhpcHuTiA1og8vpYMJiAFYae04RTVX.yqFsrq', 'artist', '2024-04-29 09:56:20.152272'),
(53, 'gigout', '$2a$10$pdaXuo0/d8inip4trix2GOxHBSeO2T3OZQjh3syax/rRZotuP4GP6', 'venue', '2024-04-29 10:00:36.611472'),
(61, 'grotto', '$2a$10$WTQVB69poo8c9L2emmCQ8ecDwTbYhsMLQbg3aUHY3Pf6F54KrE4ny', 'venue', '2024-05-02 09:34:53.577881'),
(62, 'skyline', '$2a$10$VcLP4wnMj/OHjye/cSn5buQLNct8dVzgq9qyb9bANRCIUNHt9m0rW', 'venue', '2024-05-02 09:35:43.122285'),
(63, 'riffraffs', '$2a$10$.gyiVBMt6tBn8qQTwwFfyOIMukbhpzKZn80ClGeKjuIBJNjTnhayC', 'artist', '2024-05-02 10:36:56.966575'),
(64, 'bombayroyale', '$2a$10$AgTvSArDVXp3xM9a6B0e5.MabCfqIhLR3oDTwgO8aKg2Ef6alqJ0m', 'artist', '2024-05-02 10:38:33.198769');

INSERT INTO "public"."venue_details" ("user_id", "venue_name", "address", "bio") VALUES
(53, 'Gigout', '233 Orchard Road, Singapore 238857', 'Gigout is a premier live music venue located in the heart of Singapore’s Orchard Road. Known for its exceptional acoustics and intimate setting, Echoes hosts a variety of musical acts from around the world. The venue prides itself on supporting local talent and offering a diverse lineup of performances, from indie rock to jazz and classical concerts, making it a cultural hub for music lovers.'),
(61, 'The Grotto', '333 River Valley Road, Singapore 238297', 'The Grotto is a subterranean-inspired bar located beneath the bustling streets of Singapore''s River Valley. With natural rock formations and cascading water features, this venue offers an immersive, cave-like atmosphere that is both mysterious and luxurious. The Grotto specializes in craft cocktails and live music, creating a unique night out for those seeking an escape with an edge of adventure.'),
(62, 'Skyline Bar', '50 Raffles Place, Singapore 048623', 'Skyline Bar is a rooftop bar perched atop one of Singapore''s tallest skyscrapers. Offering breathtaking panoramic views of the city skyline, this venue is known for its elegant décor, sophisticated crowd, and a live music lineup that is as spectacular as its vista. With a focus on jazz and refined pop, Skyline Bar is the quintessential spot for a night to remember.');

ALTER TABLE "public"."artist_details" ADD FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");
ALTER TABLE "public"."chat_messages" ADD FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id");
ALTER TABLE "public"."chat_messages" ADD FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id");
ALTER TABLE "public"."gigs" ADD FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");
ALTER TABLE "public"."reviews" ADD FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id");
ALTER TABLE "public"."reviews" ADD FOREIGN KEY ("reviewee_id") REFERENCES "public"."users"("id");


-- Indices
CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);
ALTER TABLE "public"."venue_details" ADD FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");
