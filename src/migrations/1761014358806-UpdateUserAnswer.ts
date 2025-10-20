import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserAnswer1761014358806 implements MigrationInterface {
    name = 'UpdateUserAnswer1761014358806'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_answer" ADD "toeic_part_id" integer`);
        await queryRunner.query(`ALTER TABLE "user_answer" ADD "toeic_test_id" integer`);
        await queryRunner.query(`ALTER TABLE "user_answer" ADD CONSTRAINT "FK_c25ff2f61c500d0ea6979e0deda" FOREIGN KEY ("toeic_part_id") REFERENCES "toeic_parts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_answer" ADD CONSTRAINT "FK_0b35d24a82fbec69c706c88c20a" FOREIGN KEY ("toeic_test_id") REFERENCES "toeic_tests"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_answer" DROP CONSTRAINT "FK_0b35d24a82fbec69c706c88c20a"`);
        await queryRunner.query(`ALTER TABLE "user_answer" DROP CONSTRAINT "FK_c25ff2f61c500d0ea6979e0deda"`);
        await queryRunner.query(`ALTER TABLE "user_answer" DROP COLUMN "toeic_test_id"`);
        await queryRunner.query(`ALTER TABLE "user_answer" DROP COLUMN "toeic_part_id"`);
    }

}
