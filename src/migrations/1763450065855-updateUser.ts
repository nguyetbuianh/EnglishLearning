import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUser1763450065855 implements MigrationInterface {
    name = 'UpdateUser1763450065855'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "role" character varying(25) NOT NULL DEFAULT 'User'`);
        await queryRunner.query(`ALTER TABLE "vocabulary" ALTER COLUMN "is_active" SET DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vocabulary" ALTER COLUMN "is_active" SET DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
    }

}
