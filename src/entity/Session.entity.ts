import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation, UpdateDateColumn } from "typeorm";
import { Tenant } from "./Tenant.entity";

@Entity({name: "main_session"})
export class Session {
    @PrimaryGeneratedColumn("uuid")
    id: string;

//    @ManyToOne(() => Tenant, (tenant) => tenant.sessions)
//    @JoinColumn({name: "tenant_id"})
//    tenant: Relation<Tenant>;

    @Column()
    service_id: string;

    @Column()
    status: string;

    @Column()
    source_language: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @Column({nullable: true})
    ended_at: Date;

}