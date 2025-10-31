import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateVocab1761896482550 implements MigrationInterface {
    name = 'UpdateVocab1761896482550'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vocabulary" ADD CONSTRAINT "UQ_d7ad625d7833adb614eb10c818e" UNIQUE ("word")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vocabulary" DROP CONSTRAINT "UQ_d7ad625d7833adb614eb10c818e"`);
    }

}
