import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateDailyAnswer1762846348005 implements MigrationInterface {
    name = 'UpdateDailyAnswer1762846348005'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "daily_practice_answer" ADD CONSTRAINT "UQ_94989f87a0e57a25c79a1148f28" UNIQUE ("question_id", "user_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "daily_practice_answer" DROP CONSTRAINT "UQ_94989f87a0e57a25c79a1148f28"`);
    }

}
