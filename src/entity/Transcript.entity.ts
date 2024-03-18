import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation, UpdateDateColumn } from "typeorm";
import { Tenant } from "./Tenant.entity.js";
import { Phrase } from "./Phrase.entity.js";
import { Session } from "./Session.entity.js";

@Entity({name: "main_transcript"})
export class Transcript{
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => Tenant, (tenant) => tenant.transcripts)
    @JoinColumn({ name: 'tenant_id' })
    tenant: Relation<Tenant>;

    // A transcript is made up of many sentences/phrases
    @OneToMany(() => Phrase, (phrase) => phrase.transcript)
    phrases: Phrase[];

    // You can have multiple transcripts (stop/start recording) in one church session
    @ManyToOne(() => Session, (session) => session.transcripts, { onDelete: 'CASCADE'})
    session: Relation<Session>;

    @Column({nullable: true})
    message_count: number;

    @Column({nullable: false})
    service_id: string;

    @Column({nullable: true})
    status: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @Column({nullable: true})
    ended_at: Date;

}