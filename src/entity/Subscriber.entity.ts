import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Relation, UpdateDateColumn } from "typeorm";
import { Session } from "./Session.entity.js";

@Entity({ name: "main_subscribers"})
export class Subscriber {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    tenant_id: string;

    @ManyToOne(() => Session, (session) => session.subscribers)
    session: Relation<Session>;

    @Column()
    room: string;

    @Column()
    user_agent: string;

    @Column()
    socket_id: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @Column({nullable: true})
    ended_at: Date;
}
