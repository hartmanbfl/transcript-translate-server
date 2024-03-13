import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, Relation } from "typeorm";
import { Tenant } from "./Tenant.entity.js";

@Entity({name: "main_church_properties" })
export class ChurchProperties {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @OneToOne(() => Tenant, (tenant) => tenant.church_properties)
    @JoinColumn({name: 'tenant_id'})
    tenant: Relation<Tenant>;

    @Column({
        name: 'service_timeout_in_min',
        default: 90 
    })
    serviceTimeoutInMin: number;

    @Column({
        name: 'default_service_id',
        default: '1'
    })
    defaultServiceId: string;

    @Column({
        name: 'default_language',
        default: 'en-US'
    })
    defaultLanguage: string;

    @Column({
        name: 'translation_languages',
        default: '[{"name": "English", "locale": "en-US"},{"name": "French", "locale": "fr-FR"},{"name": "German", "locale": "de-DE"},{"name": "Ukranian", "locale":"uk-UA"}]'
    })
    translationLanguages: string;
}