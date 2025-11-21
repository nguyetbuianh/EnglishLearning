import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserandVocab1763456585849 implements MigrationInterface {
    name = 'UpdateUserandVocab1763456585849'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vocabulary" ADD "user_id" bigint`);
        await queryRunner.query(`ALTER TABLE "vocabulary" ADD CONSTRAINT "FK_0820235ecc44ac66b18507abaa6" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vocabulary" DROP CONSTRAINT "FK_0820235ecc44ac66b18507abaa6"`);
        await queryRunner.query(`ALTER TABLE "vocabulary" DROP COLUMN "user_id"`);
    }

}
