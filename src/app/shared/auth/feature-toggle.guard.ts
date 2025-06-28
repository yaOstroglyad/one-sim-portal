import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { isToggleActive } from '../services/feature-toggle';

@Injectable({
  providedIn: 'root'
})
export class FeatureToggleGuard implements CanActivate {
  
  constructor(private router: Router) {}
  
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    // Get the feature toggle key from route data
    const featureToggleKey = route.data['featureToggle'];
    
    if (!featureToggleKey) {
      // If no feature toggle specified, allow access
      return true;
    }
    
    // Check if the feature is enabled
    const isEnabled = isToggleActive(featureToggleKey);
    
    if (!isEnabled) {
      // Redirect to 404 or 403 page if feature is disabled
      this.router.navigate(['/404']);
      return false;
    }
    
    return true;
  }
}