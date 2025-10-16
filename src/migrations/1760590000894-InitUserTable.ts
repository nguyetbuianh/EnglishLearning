import { MigrationInterface, QueryRunner } from "typeorm";

export class InitUserTable1760590000894 implements MigrationInterface {
    name = 'InitUserTable1760590000894'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "joined_at" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "joined_at"`);
    }

}
