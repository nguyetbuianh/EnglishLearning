import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTopicVocabulary1761039261651 implements MigrationInterface {
    name = 'CreateTopicVocabulary1761039261651'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "topic-vocabularies" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "type" character varying NOT NULL DEFAULT 'general', "description" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4812743da3628f92e1814acba25" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "topic-vocabularies"`);
    }

}
