import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateChainWord1764152685667 implements MigrationInterface {
    name = 'CreateChainWord1764152685667'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "chain-word" ("id" SERIAL NOT NULL, "word" character varying(100) NOT NULL, "create_by" character varying(50) NOT NULL, "user_id" character varying(225) NOT NULL, CONSTRAINT "PK_b35528b961f4c1b24cb3f1acb8e" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "chain-word"`);
    }

}
