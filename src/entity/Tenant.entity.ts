import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, Relation, OneToMany } from "typeorm";
import { AppThemingData } from "./AppThemingData.entity.js";
import { Transcript} from "./Transcript.entity.js";
import { User } from "./User.entity.js";
import { ChurchProperties } from "./ChurchProperties.entity.js";
import { Session } from "./Session.entity.js";

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

  @Column({ nullable: true, select: false })
  deepgram_api_key: string;

  @Column({ nullable: true })
  deepgram_project: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => AppThemingData, (app_theming_data) => app_theming_data.tenant, { cascade: true })
  app_theming_data: Relation<AppThemingData>;

  @OneToOne(() => ChurchProperties, (church_properties) => church_properties.tenant, { cascade: true })
  church_properties: Relation<ChurchProperties>;

  @Column({nullable: true})
  app_theming_data_id: string;

  @OneToMany(() => Transcript, (transcript) => transcript.tenant)
  transcripts: Transcript[];

//  @OneToMany(() => Session, (session) => session.tenant)
//  sessions: Session[];

  @OneToMany(() => User, (user) => user.tenant)
  users: User[];
}