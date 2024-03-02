import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, Relation } from "typeorm";
import { AppThemingData } from "./AppThemingData.entity.js";

@Entity({ name: "main_tenant" })
export class Tenant {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false, unique: true })
  name: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: false })
  deepgram_api_key: string;

  @Column({ nullable: false })
  deepgram_project: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => AppThemingData, (app_theming_data) => app_theming_data.tenant, { cascade: true })
  @JoinColumn({name: "app_theming_data_id"})
  app_theming_data: Relation<AppThemingData>;

  @Column()
  app_theming_data_id: string;
}