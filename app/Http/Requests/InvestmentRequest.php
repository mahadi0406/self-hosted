<?php

namespace App\Http\Requests;

use App\Models\InvestmentPlan;
use Illuminate\Foundation\Http\FormRequest;

class InvestmentRequest extends FormRequest
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
            'plan_id' => [
                'required',
                'integer',
                'exists:investment_plans,id',
            ],
            'amount' => [
                'required',
                'numeric',
                'min:1',
                'max:999999999',
                function ($attribute, $value, $fail) {
                    if (!$this->plan_id) {
                        return;
                    }

                    $plan = InvestmentPlan::find($this->plan_id);

                    if (!$plan) {
                        $fail(__('Invalid investment plan.'));
                        return;
                    }

                    if ($value < $plan->min_amount) {
                        $fail(__('Amount must be at least :min', [
                            'min' => config('app.currency_symbol', '$') . number_format($plan->min_amount, 2)
                        ]));
                    }

                    if ($value > $plan->max_amount) {
                        $fail(__('Amount cannot exceed :max', [
                            'max' => config('app.currency_symbol', '$') . number_format($plan->max_amount, 2)
                        ]));
                    }
                },
            ],
        ];
    }


    /**
     * @return array
     */
    public function messages(): array
    {
        return [
            'plan_id.required' => __('Please select an investment plan.'),
            'plan_id.exists' => __('The selected investment plan is invalid.'),
            'amount.required' => __('Please enter an investment amount.'),
            'amount.numeric' => __('Amount must be a valid number.'),
            'amount.min' => __('Amount must be greater than zero.'),
            'amount.max' => __('Amount is too large.'),
        ];
    }


    /**
     * @return array
     */
    public function attributes(): array
    {
        return [
            'plan_id' => __('investment plan'),
            'amount' => __('investment amount'),
        ];
    }
}
