import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserAnswer1761125918029 implements MigrationInterface {
    name = 'UpdateUserAnswer1761125918029'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_answer" ADD "question_id" bigint`);
        await queryRunner.query(`ALTER TABLE "user_answer" ADD CONSTRAINT "FK_09c48ec03d5ae846ea0a97618e0" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_answer" DROP CONSTRAINT "FK_09c48ec03d5ae846ea0a97618e0"`);
        await queryRunner.query(`ALTER TABLE "user_answer" DROP COLUMN "question_id"`);
    }

}
