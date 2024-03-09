import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, Relation, JoinColumn } from "typeorm";
import { Tenant } from "./Tenant.entity.js";

@Entity({ name: "main_user" })
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => Tenant, (tenant) => tenant.users)
    @JoinColumn({name: 'tenant_id'})
    tenant: Tenant;

    @Column({ nullable: false })
    fullname: string;

    @Column({ nullable: false, unique: true })
    username: string;

    @Column({ nullable: true})
    email: string;

    @Column({ nullable: false, select: false })
    password: string;

    @Column({ default: "user" })
    role: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
