import { MigrationInterface, QueryRunner } from "typeorm";

export class Vocab1761805756333 implements MigrationInterface {
    name = 'Vocab1761805756333'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "topic" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "type" character varying NOT NULL DEFAULT 'general', "description" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_33aa4ecb4e4f20aa0157ea7ef61" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "favorite_vocabulary" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" bigint, "vocabulary_id" bigint, CONSTRAINT "UQ_1d88f95456fe7b5a7f4ac0ff6e7" UNIQUE ("user_id", "vocabulary_id"), CONSTRAINT "PK_d6920a008f807a1f577329b25d2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "vocabulary" ("id" BIGSERIAL NOT NULL, "word" character varying(100) NOT NULL, "pronounce" character varying(100) NOT NULL, "part_of_speech" character varying(50), "meaning" text, "example_sentence" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "topic_id" integer, CONSTRAINT "PK_65dbd74f76cee79778299a2a21b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "favorite_vocabulary" ADD CONSTRAINT "FK_569b63178b3bbaf66c38414c3e4" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "favorite_vocabulary" ADD CONSTRAINT "FK_b2db49848474b49fe2978ec1933" FOREIGN KEY ("vocabulary_id") REFERENCES "vocabulary"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vocabulary" ADD CONSTRAINT "FK_aef96ca5f37fce2b8693eccf24a" FOREIGN KEY ("topic_id") REFERENCES "topic"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vocabulary" DROP CONSTRAINT "FK_aef96ca5f37fce2b8693eccf24a"`);
        await queryRunner.query(`ALTER TABLE "favorite_vocabulary" DROP CONSTRAINT "FK_b2db49848474b49fe2978ec1933"`);
        await queryRunner.query(`ALTER TABLE "favorite_vocabulary" DROP CONSTRAINT "FK_569b63178b3bbaf66c38414c3e4"`);
        await queryRunner.query(`DROP TABLE "vocabulary"`);
        await queryRunner.query(`DROP TABLE "favorite_vocabulary"`);
        await queryRunner.query(`DROP TABLE "topic"`);
    }

}
