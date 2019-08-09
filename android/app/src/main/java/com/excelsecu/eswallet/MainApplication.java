package com.excelsecu.eswallet;

import android.app.Application;
import android.content.Context;
import android.support.multidex.MultiDex;


import com.AlexanderZaytsev.RNI18n.RNI18nPackage;
import com.excelsecu.rnwallet.crypto.CryptoReactPackage;
import com.facebook.react.ReactApplication;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import com.swmansion.rnscreens.RNScreensPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.excelsecu.rnwallet.BtDeviceReactPackage;
import io.realm.react.RealmReactPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.oblador.vectoricons.VectorIconsPackage;

import org.reactnative.camera.RNCameraPackage;

import java.util.Arrays;
import java.util.List;



public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.asList(
              new MainReactPackage(),
            new SplashScreenReactPackage(),
            new RNScreensPackage(),
            new RNGestureHandlerPackage(),
              new RealmReactPackage(),
              new RNCameraPackage(),
              new VectorIconsPackage(),
              new RNI18nPackage(),
              new BtDeviceReactPackage(),
              new CryptoReactPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }

  @Override
  protected void attachBaseContext(Context base) {
    super.attachBaseContext(base);
    MultiDex.install(this);
  }
}
