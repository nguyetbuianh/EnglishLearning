import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDailyPracticeAnswerandUserStat1761287746709 implements MigrationInterface {
    name = 'CreateDailyPracticeAnswerandUserStat1761287746709'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "topic" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "type" character varying NOT NULL DEFAULT 'general', "description" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_33aa4ecb4e4f20aa0157ea7ef61" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "vocabulary" ("id" BIGSERIAL NOT NULL, "word" character varying(100) NOT NULL, "pronounce" character varying(100) NOT NULL, "part_of_speech" character varying(50), "meaning" text, "example_sentence" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "topic_id" integer, CONSTRAINT "PK_65dbd74f76cee79778299a2a21b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_stats" ("id" SERIAL NOT NULL, "total_answers" integer NOT NULL DEFAULT '0', "correct_answers" integer NOT NULL DEFAULT '0', "points" integer NOT NULL DEFAULT '0', "streak_days" integer NOT NULL DEFAULT '0', "last_answer_date" date, "badges" text, "user_id" bigint, CONSTRAINT "REL_0e0da843088caf61925ded4434" UNIQUE ("user_id"), CONSTRAINT "PK_f55fb5b508e96b05303efae93e5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."daily_practice_answer_chosenoption_enum" AS ENUM('A', 'B', 'C', 'D')`);
        await queryRunner.query(`CREATE TABLE "daily_practice_answer" ("id" SERIAL NOT NULL, "chosenOption" "public"."daily_practice_answer_chosenoption_enum" NOT NULL, "is_correct" boolean NOT NULL, "answered_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" bigint, "question_id" bigint, CONSTRAINT "PK_b875b19131ea3cfbffc55b05a30" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "vocabulary" ADD CONSTRAINT "FK_aef96ca5f37fce2b8693eccf24a" FOREIGN KEY ("topic_id") REFERENCES "topic"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_stats" ADD CONSTRAINT "FK_0e0da843088caf61925ded4434e" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "daily_practice_answer" ADD CONSTRAINT "FK_f317d8eb2c88e27dacbda640f01" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "daily_practice_answer" ADD CONSTRAINT "FK_b979a36c6cb8a88d929087adfae" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "daily_practice_answer" DROP CONSTRAINT "FK_b979a36c6cb8a88d929087adfae"`);
        await queryRunner.query(`ALTER TABLE "daily_practice_answer" DROP CONSTRAINT "FK_f317d8eb2c88e27dacbda640f01"`);
        await queryRunner.query(`ALTER TABLE "user_stats" DROP CONSTRAINT "FK_0e0da843088caf61925ded4434e"`);
        await queryRunner.query(`ALTER TABLE "vocabulary" DROP CONSTRAINT "FK_aef96ca5f37fce2b8693eccf24a"`);
        await queryRunner.query(`DROP TABLE "daily_practice_answer"`);
        await queryRunner.query(`DROP TYPE "public"."daily_practice_answer_chosenoption_enum"`);
        await queryRunner.query(`DROP TABLE "user_stats"`);
        await queryRunner.query(`DROP TABLE "vocabulary"`);
        await queryRunner.query(`DROP TABLE "topic"`);
    }

}
