import { MigrationInterface, QueryRunner } from "typeorm";

export class TestnadPartToeic1760597233142 implements MigrationInterface {
    name = 'TestnadPartToeic1760597233142'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "toeic_parts" ("id" SERIAL NOT NULL, "part_number" integer NOT NULL, "title" character varying(100) NOT NULL, "description" text, CONSTRAINT "CHK_5aa8c1c3ecbe3857a26f5744cf" CHECK ("part_number" >= 1 AND "part_number" <= 7), CONSTRAINT "PK_0a31882f9fc66ebb9ee06e55ec6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "toeic_tests" ("id" SERIAL NOT NULL, "title" character varying(100) NOT NULL, "description" text, "created_at" TIMESTAMP NOT NULL, CONSTRAINT "PK_047f587a2eda8626443b0126d54" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "toeic_tests"`);
        await queryRunner.query(`DROP TABLE "toeic_parts"`);
    }
}
