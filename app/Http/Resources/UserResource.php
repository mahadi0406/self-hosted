<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uid' => $this->uid,
            'name' => $this->name,
            'email' => $this->email,
            'email_verified_at' => $this->email_verified_at?->format('Y-m-d H:i:s'),
            'role' => $this->role ?? 'user',
            'status' => $this->status ?? 'active',
            'kyc_status' => $this->kyc_status ?? 'pending',
            'gender' => $this->gender,
            'avatar' => $this->avatar,
            'avatar_url' => $this->avatar_url,
            'is_admin' => $this->is_admin ?? false,
            'wallet_address' => $this->wallet_address,
            'wallet_type' => $this->wallet_type ?? 'metamask',
            'referral_code' => $this->referral_code,
            'referred_by' => $this->referred_by,
            'total_referrals' => $this->total_referrals ?? 0,
            'active_referrals' => $this->active_referrals ?? 0,
            'risk_tolerance' => $this->risk_tolerance ?? 'moderate',
            'ai_score' => $this->ai_score ? (float) $this->ai_score : 0.00,
            'last_login_at' => $this->last_login_at?->format('Y-m-d H:i:s'),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
            'wallet' => $this->whenLoaded('wallet'),
            'kyc_verification' => $this->whenLoaded('kycVerification'),
            'referrals' => $this->whenLoaded('referrals'),
            'referred_by_user' => $this->whenLoaded('referredBy', function () {
                return [
                    'id' => $this->referredBy->id,
                    'name' => $this->referredBy->name,
                    'email' => $this->referredBy->email,
                ];
            }),
        ];
    }
}
