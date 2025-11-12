import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserAnswer1762845328204 implements MigrationInterface {
    name = 'UpdateUserAnswer1762845328204'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "questions" DROP CONSTRAINT "UQ_1c7fbfc4b51b46e7456695f4227"`);
        await queryRunner.query(`ALTER TABLE "questions" ALTER COLUMN "question_number" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "questions" ALTER COLUMN "question_text" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "questions" ALTER COLUMN "correct_option" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "questions" ADD CONSTRAINT "UQ_1c7fbfc4b51b46e7456695f4227" UNIQUE ("test_id", "part_id", "question_number")`);
        await queryRunner.query(`ALTER TABLE "user_answer" ADD CONSTRAINT "UQ_ce16bb81d8a764ed85cac522538" UNIQUE ("question_id", "user_id", "toeic_test_id", "toeic_part_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_answer" DROP CONSTRAINT "UQ_ce16bb81d8a764ed85cac522538"`);
        await queryRunner.query(`ALTER TABLE "questions" DROP CONSTRAINT "UQ_1c7fbfc4b51b46e7456695f4227"`);
        await queryRunner.query(`ALTER TABLE "questions" ALTER COLUMN "correct_option" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "questions" ALTER COLUMN "question_text" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "questions" ALTER COLUMN "question_number" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "questions" ADD CONSTRAINT "UQ_1c7fbfc4b51b46e7456695f4227" UNIQUE ("question_number", "test_id", "part_id")`);
    }

}
