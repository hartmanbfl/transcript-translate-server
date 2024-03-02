import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from "typeorm";
import { AppThemingData } from "./AppThemingData.entity.js";

@Entity({ name: "main_database_file"})
export class DatabaseFile {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    filename: string;

    @Column({ type: "bytea"})
    data: Uint8Array;
}