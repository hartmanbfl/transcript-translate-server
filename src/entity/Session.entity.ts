import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation, UpdateDateColumn } from "typeorm";
import { Tenant } from "./Tenant.entity.js";
import { Subscriber } from "./Subscriber.entity.js";
import { Transcript } from "./Transcript.entity.js";

@Entity({name: "main_session"})
export class Session {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => Tenant, (tenant) => tenant.sessions)
    @JoinColumn({name: "tenant_id"})
    tenant: Relation<Tenant>;

    @OneToMany(() => Subscriber, (subscriber) => subscriber.session)
    subscribers: Relation<Subscriber[]>;

    @OneToMany(() => Transcript, (transcript) => transcript.session)
    transcripts: Relation<Transcript[]>;

    @Column()
    service_id: string;

    @Column()
    status: string;

    @Column("text", { array: true, nullable: true })
    languages: string[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @Column({nullable: true})
    ended_at: Date;

}