import { MigrationInterface, QueryRunner } from "typeorm";

export class InitUserTable1760582307278 implements MigrationInterface {
    name = 'InitUserTable1760582307278'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" BIGSERIAL NOT NULL, "mezon_user_id" character varying(500) NOT NULL, "username" character varying(255), "joined_at" TIMESTAMP NOT NULL, CONSTRAINT "UQ_93fed282a4b789488e6a76ff5d4" UNIQUE ("mezon_user_id"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
