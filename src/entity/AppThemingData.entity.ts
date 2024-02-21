import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne } from "typeorm";
import { Tenant } from "./Tenant.entity.js";
import { DatabaseFile } from "./DatabaseFile.entity.js";

@Entity({ name: "main_theming_data" })
export class AppThemingData {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => Tenant)
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant 

    @Column()
    greeting: string;

    @Column()
    message: string;

    @Column()
    additional_welcome_message: string;

    @Column()
    waiting_message: string;

    @JoinColumn({ name: 'logoId' })
    @OneToOne(() => DatabaseFile, { nullable: true })
    logo?: DatabaseFile;

    @Column({ nullable: true })
    logoId?: string;
}