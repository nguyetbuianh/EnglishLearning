import { MigrationInterface, QueryRunner } from "typeorm";

export class DisplayQuestionFeature1760605354660 implements MigrationInterface {
    name = 'DisplayQuestionFeature1760605354660'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "passages" ("id" SERIAL NOT NULL, "title" character varying(225), "content" text NOT NULL, "created_at" TIMESTAMP NOT NULL, "part_id" integer, CONSTRAINT "PK_5f625d72252d22b1826b4ac79cf" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "question_options" ("id" SERIAL NOT NULL, "option_label" character(1) NOT NULL, "option_text" text NOT NULL, "question_id" bigint, CONSTRAINT "PK_13be20e51c0738def32f00cf7d5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "questions" ("id" BIGSERIAL NOT NULL, "question_number" integer NOT NULL, "question_text" text NOT NULL, "correct_option" character(1) NOT NULL, "explanation" text, "image_url" character varying(255), "audio_url" character varying(255), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "test_id" integer, "part_id" integer, "passage_id" integer, CONSTRAINT "UQ_1c7fbfc4b51b46e7456695f4227" UNIQUE ("test_id", "part_id", "question_number"), CONSTRAINT "PK_08a6d4b0f49ff300bf3a0ca60ac" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "joined_at" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "passages" ADD CONSTRAINT "FK_48fb350b4a2fb51bd954002ea7c" FOREIGN KEY ("part_id") REFERENCES "toeic_parts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "question_options" ADD CONSTRAINT "FK_f0b7aaabd3f88e700daf0fe681c" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "questions" ADD CONSTRAINT "FK_b1f107600ed9ed81aba56edfcea" FOREIGN KEY ("test_id") REFERENCES "toeic_tests"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "questions" ADD CONSTRAINT "FK_36cead6eed9842f1501e34e371b" FOREIGN KEY ("part_id") REFERENCES "toeic_parts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "questions" ADD CONSTRAINT "FK_71de478c6bb3635a98680f68037" FOREIGN KEY ("passage_id") REFERENCES "passages"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "questions" DROP CONSTRAINT "FK_71de478c6bb3635a98680f68037"`);
        await queryRunner.query(`ALTER TABLE "questions" DROP CONSTRAINT "FK_36cead6eed9842f1501e34e371b"`);
        await queryRunner.query(`ALTER TABLE "questions" DROP CONSTRAINT "FK_b1f107600ed9ed81aba56edfcea"`);
        await queryRunner.query(`ALTER TABLE "question_options" DROP CONSTRAINT "FK_f0b7aaabd3f88e700daf0fe681c"`);
        await queryRunner.query(`ALTER TABLE "passages" DROP CONSTRAINT "FK_48fb350b4a2fb51bd954002ea7c"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "joined_at" DROP DEFAULT`);
        await queryRunner.query(`DROP TABLE "questions"`);
        await queryRunner.query(`DROP TABLE "question_options"`);
        await queryRunner.query(`DROP TABLE "passages"`);
    }

}
