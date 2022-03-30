import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BusinessmgmtComponent } from './businessmgmt/businessmgmt.component';
import { CommercialmgmtComponent } from './commercialmgmt/commercialmgmt.component';
import { EmailotpComponent } from './emailotp/emailotp.component';
import { FactorselectionComponent } from './factorselection/factorselection.component';
import { FidoComponent } from './fido/fido.component';
import { InitComponent } from './init/init.component';
import { InvestmgmtComponent } from './investmgmt/investmgmt.component';
import { LdapComponent } from './ldap/ldap.component';
import { MotpComponent } from './motp/motp.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { PushComponent } from './push/push.component';
import { SelfServiceComponent } from './self-service/self-service.component';
import { SotpComponent } from './sotp/sotp.component';
import { WealthmgmtComponent } from './wealthmgmt/wealthmgmt.component';
import { WelcomeComponent } from './welcome/welcome.component';


const routes: Routes = [
  { path: 'fido', component: FidoComponent },
  { path: 'security-key', component: FidoComponent },
  { path: 'verify', component: LdapComponent },
  { path: 'sotp', component: SotpComponent },
  { path: 'welcome', component: WelcomeComponent },
  { path: '', component: InitComponent },
  { path: 'factorselection', component: FactorselectionComponent },
  { path: 'motp', component: MotpComponent },
  { path: 'push', component: PushComponent },
  { path: 'investmgmt', component: InvestmgmtComponent },
  { path: 'bizmgmt', component: BusinessmgmtComponent },
  { path: 'wealthmgmt', component: WealthmgmtComponent },
  { path: 'commercialmgmt', component: CommercialmgmtComponent },
  { path: 'eotp', component: EmailotpComponent },
  { path: 'self-service', component: SelfServiceComponent },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }


