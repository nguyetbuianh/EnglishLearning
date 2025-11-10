import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateChannel1762400386925 implements MigrationInterface {
    name = 'CreateChannel1762400386925'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "channels" ("id" SERIAL NOT NULL, "channel_id" character varying(225), "channel_name" character varying(225) NOT NULL, CONSTRAINT "UQ_e5809c462cb7e05ef84de3c7843" UNIQUE ("channel_id"), CONSTRAINT "PK_bc603823f3f741359c2339389f9" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`DROP TABLE "channels"`);
    }

}
