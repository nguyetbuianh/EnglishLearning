import { MigrationInterface, QueryRunner } from "typeorm";

export class UserProgress1761104337486 implements MigrationInterface {
    name = 'UserProgress1761104337486'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_progress" ("id" SERIAL NOT NULL, "user_mezon_id" character varying NOT NULL, "current_question_number" integer, "current_passage_number" integer, "is_completed" boolean NOT NULL DEFAULT false, "test_id" integer, "part_id" integer, CONSTRAINT "UQ_93751ad2f04611808fe3269f19d" UNIQUE ("user_mezon_id", "test_id", "part_id"), CONSTRAINT "PK_7b5eb2436efb0051fdf05cbe839" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_progress" ADD CONSTRAINT "FK_1da3d455140e4de59ac4bebc954" FOREIGN KEY ("test_id") REFERENCES "toeic_tests"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_progress" ADD CONSTRAINT "FK_f701ea39d620bb6b71a50b17a8e" FOREIGN KEY ("part_id") REFERENCES "toeic_parts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_progress" DROP CONSTRAINT "FK_f701ea39d620bb6b71a50b17a8e"`);
        await queryRunner.query(`ALTER TABLE "user_progress" DROP CONSTRAINT "FK_1da3d455140e4de59ac4bebc954"`);
        await queryRunner.query(`DROP TABLE "user_progress"`);
    }

}
