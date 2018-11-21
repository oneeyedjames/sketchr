import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';

import { HomePage } from '../pages/home/home';
import { PickerPage } from '../pages/picker/picker';

import { ComponentsModule } from '../components/components.module';
import { ColorProvider } from '../providers/color/color';
import { SizeProvider } from '../providers/size/size';

@NgModule({
	declarations: [
		MyApp,
		HomePage,
		PickerPage
	],
	imports: [
		BrowserModule,
		ComponentsModule,
		IonicModule.forRoot(MyApp)
	],
	bootstrap: [IonicApp],
	entryComponents: [
		MyApp,
		HomePage,
		PickerPage
	],
	providers: [
		StatusBar,
		SplashScreen,
		{provide: ErrorHandler, useClass: IonicErrorHandler},
		ColorProvider,
		SizeProvider
	]
})
export class AppModule {}
