import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, Relation, OneToMany } from "typeorm";
import { AppThemingData } from "./AppThemingData.entity.js";
import { Transcript} from "./Transcript.entity.js";
import { User } from "./User.entity.js";

@Entity({ name: "main_tenant" })
export class Tenant {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false, unique: true })
  name: string;
  
  @Column( {nullable: false, unique: true})
  church_key: string

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  deepgram_api_key: string;

  @Column({ nullable: true })
  deepgram_project: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => AppThemingData, (app_theming_data) => app_theming_data.tenant, { cascade: true })
//  @JoinColumn({name: "app_theming_data_id"})
  app_theming_data: Relation<AppThemingData>;

  @Column({nullable: true})
  app_theming_data_id: string;

  @OneToMany(() => Transcript, (transcript) => transcript.tenant)
  transcripts: Transcript[];

  @OneToMany(() => User, (user) => user.tenant)
  users: User[];
}