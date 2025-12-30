import { MigrationInterface, QueryRunner } from "typeorm";

export class FeedbackEntity1767065793581 implements MigrationInterface {
    name = 'FeedbackEntity1767065793581'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "feedbacks" ("id" SERIAL NOT NULL, "userId" character varying(50) NOT NULL, "message" text NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_79affc530fdd838a9f1e0cc30be" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "topic" DROP COLUMN "user_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "topic" ADD "user_id" bigint`);
        await queryRunner.query(`DROP TABLE "feedbacks"`);
    }

}
