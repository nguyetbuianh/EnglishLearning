import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePassageEntity1760688554843 implements MigrationInterface {
    name = 'UpdatePassageEntity1760688554843'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "passages" DROP CONSTRAINT "passages_part_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "passages" ADD "passage_number" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "passages" ADD "test_id" integer`);
        await queryRunner.query(`ALTER TABLE "passages" DROP COLUMN "title"`);
        await queryRunner.query(`ALTER TABLE "passages" ADD "title" character varying(225)`);
        await queryRunner.query(`ALTER TABLE "passages" ALTER COLUMN "created_at" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "passages" ALTER COLUMN "created_at" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "passages" ADD CONSTRAINT "FK_9293dff639e96b9ad7773798b4e" FOREIGN KEY ("test_id") REFERENCES "toeic_tests"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "passages" ADD CONSTRAINT "FK_48fb350b4a2fb51bd954002ea7c" FOREIGN KEY ("part_id") REFERENCES "toeic_parts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "questions" ADD CONSTRAINT "FK_71de478c6bb3635a98680f68037" FOREIGN KEY ("passage_id") REFERENCES "passages"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "questions" DROP CONSTRAINT "FK_71de478c6bb3635a98680f68037"`);
        await queryRunner.query(`ALTER TABLE "passages" DROP CONSTRAINT "FK_48fb350b4a2fb51bd954002ea7c"`);
        await queryRunner.query(`ALTER TABLE "passages" DROP CONSTRAINT "FK_9293dff639e96b9ad7773798b4e"`);
        await queryRunner.query(`ALTER TABLE "passages" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "passages" ALTER COLUMN "created_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "passages" DROP COLUMN "title"`);
        await queryRunner.query(`ALTER TABLE "passages" ADD "title" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "passages" DROP COLUMN "test_id"`);
        await queryRunner.query(`ALTER TABLE "passages" DROP COLUMN "passage_number"`);
        await queryRunner.query(`ALTER TABLE "passages" ADD CONSTRAINT "passages_part_id_fkey" FOREIGN KEY ("part_id") REFERENCES "toeic_parts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
