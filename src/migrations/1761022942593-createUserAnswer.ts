import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserAnswer1761022942593 implements MigrationInterface {
    name = 'CreateUserAnswer1761022942593'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_answer_chosenoption_enum" AS ENUM('A', 'B', 'C', 'D')`);
        await queryRunner.query(`CREATE TABLE "user_answer" ("id" SERIAL NOT NULL, "chosenOption" "public"."user_answer_chosenoption_enum" NOT NULL, "is_correct" boolean, "answered_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" bigint, "toeic_part_id" integer, "toeic_test_id" integer, CONSTRAINT "PK_37b32f666e59572775b1b020fb5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_answer" ADD CONSTRAINT "FK_9f4693fc1508a5e7bc3639cd9a9" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_answer" ADD CONSTRAINT "FK_c25ff2f61c500d0ea6979e0deda" FOREIGN KEY ("toeic_part_id") REFERENCES "toeic_parts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_answer" ADD CONSTRAINT "FK_0b35d24a82fbec69c706c88c20a" FOREIGN KEY ("toeic_test_id") REFERENCES "toeic_tests"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_answer" DROP CONSTRAINT "FK_0b35d24a82fbec69c706c88c20a"`);
        await queryRunner.query(`ALTER TABLE "user_answer" DROP CONSTRAINT "FK_c25ff2f61c500d0ea6979e0deda"`);
        await queryRunner.query(`ALTER TABLE "user_answer" DROP CONSTRAINT "FK_9f4693fc1508a5e7bc3639cd9a9"`);
        await queryRunner.query(`DROP TABLE "user_answer"`);
        await queryRunner.query(`DROP TYPE "public"."user_answer_chosenoption_enum"`);
    }

}
