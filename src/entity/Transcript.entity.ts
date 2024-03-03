import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation, UpdateDateColumn } from "typeorm";
import { Tenant } from "./Tenant.entity.js";
import { Phrase } from "./Phrase.entity.js";

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

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}