// Copyright 2015-present 650 Industries. All rights reserved.

#import "AppDelegate.h"
#import <GoogleMaps/GoogleMaps.h>

@implementation AppDelegate

// Put your app delegate methods here. Remember to also call methods from EXStandaloneAppDelegate superclass
// in order to keep Expo working. See example below.

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [GMSServices provideAPIKey:@"AIzaSyAtzcxNVjs7P539qpPg_Eq0ur27QHE1imA"];
  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

@end
