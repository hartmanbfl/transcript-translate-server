var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Tenant } from "./Tenant.entity.js";
let ChurchProperties = class ChurchProperties {
};
__decorate([
    PrimaryGeneratedColumn("uuid"),
    __metadata("design:type", String)
], ChurchProperties.prototype, "id", void 0);
__decorate([
    OneToOne(() => Tenant, (tenant) => tenant.church_properties),
    JoinColumn({ name: 'tenant_id' }),
    __metadata("design:type", Object)
], ChurchProperties.prototype, "tenant", void 0);
__decorate([
    Column({
        name: 'service_timeout_in_min',
        default: 90
    }),
    __metadata("design:type", Number)
], ChurchProperties.prototype, "serviceTimeoutInMin", void 0);
__decorate([
    Column({
        name: 'default_service_id',
        default: 1
    }),
    __metadata("design:type", Number)
], ChurchProperties.prototype, "defaultServiceId", void 0);
__decorate([
    Column({
        name: 'default_language',
        default: 'en-US'
    }),
    __metadata("design:type", String)
], ChurchProperties.prototype, "defaultLanguage", void 0);
__decorate([
    Column({
        name: 'translation_languages',
        default: '[{"name": "English", "locale": "en-US"},{"name": "French", "locale": "fr-FR"},{"name": "German", "locale": "de-DE"},{"name": "Ukranian", "locale":"uk-UA"}]'
    }),
    __metadata("design:type", String)
], ChurchProperties.prototype, "translationLanguages", void 0);
ChurchProperties = __decorate([
    Entity({ name: "main_church_properties" })
], ChurchProperties);
export { ChurchProperties };
