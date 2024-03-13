import { Column, CreateDateColumn, Entity, Generated, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation, UpdateDateColumn } from "typeorm";
import { Transcript } from "./Transcript.entity.js";

@Entity({ name: "transcript_phrase" })
export class Phrase {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    tenant_id: string;

    @Column()
    transcript_id: string;

    @ManyToOne(() => Transcript, (transcript) => transcript.phrases, { onDelete: "CASCADE" })
    transcript: Relation<Transcript>;

    @Column("text")
    phrase_text: string;

    @Column()
//    @Generated('increment')
    phrase_number: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
} 