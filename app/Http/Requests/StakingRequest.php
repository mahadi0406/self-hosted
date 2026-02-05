<?php

namespace App\Http\Requests;

use App\Models\StakingPool;
use Illuminate\Foundation\Http\FormRequest;

class StakingRequest extends FormRequest
{

    /**
     * @return bool
     */
    public function authorize(): bool
    {
        return true;
    }


    /**
     * @return array
     */
    public function rules(): array
    {
        return [
            'pool_id' => [
                'required',
                'integer',
                'exists:staking_pools,id',
            ],
            'amount' => [
                'required',
                'numeric',
                'min:1',
                'max:999999999',
                function ($attribute, $value, $fail) {
                    if (!$this->pool_id) {
                        return;
                    }

                    $pool = StakingPool::find($this->pool_id);

                    if (!$pool) {
                        $fail(__('Invalid staking pool.'));
                        return;
                    }

                    if ($value < $pool->min_stake_amount) {
                        $fail(__('Amount must be at least :min', [
                            'min' => config('app.currency_symbol', '$') . number_format($pool->min_stake_amount, 2)
                        ]));
                    }

                    if ($pool->max_stake_amount && $value > $pool->max_stake_amount) {
                        $fail(__('Amount cannot exceed :max', [
                            'max' => config('app.currency_symbol', '$') . number_format($pool->max_stake_amount, 2)
                        ]));
                    }
                },
            ],
            'auto_compound' => [
                'sometimes',
                'boolean',
            ],
        ];
    }


    /**
     * @return array
     */
    public function messages(): array
    {
        return [
            'pool_id.required' => __('Please select a staking pool.'),
            'pool_id.exists' => __('The selected staking pool is invalid.'),
            'amount.required' => __('Please enter a stake amount.'),
            'amount.numeric' => __('Amount must be a valid number.'),
            'amount.min' => __('Amount must be greater than zero.'),
            'amount.max' => __('Amount is too large.'),
            'auto_compound.boolean' => __('Auto-compound must be true or false.'),
        ];
    }


    /**
     * @return array
     */
    public function attributes(): array
    {
        return [
            'pool_id' => __('staking pool'),
            'amount' => __('stake amount'),
            'auto_compound' => __('auto-compound'),
        ];
    }
}
