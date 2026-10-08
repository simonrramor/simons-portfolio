const STATSIG_PROJECT = '5W0UDCfBOqAStqlQip9r6P';

const experimentSlugs: Record<string, string> = {
  'Invite prompt after good money moments': 'invite_nudge_celebrations',
  'Referral reward in the activity feed': 'show_referral_reward_in_tx_feed_for_referees',
  'Receipt screen without a Done button (Android)': 'post_payment_receipt_hide_done_button_android',
  '“Double your salary” banner': 'double_your_salary_ctas',
  'New-user checklist (organic users)': 'new_user_checklist_non_referred_users',
  'New-user checklist (referred users)': 'new_user_checklist_referred_users',
  'Invite friends during signup': 'signup_invite_friends',
  'Share receipt after paying someone': 'post_payment_receipt_share',
  'Support card on USD account screen (Android)': 'virtual_account_support_card_android',
  'Confirm button on country picker': 'idv_country_picker_confirm_step',
  'Invite tab in the tab bar (iOS)': 'referral_tab',
  '“Earn $X” referral button (iOS)': 'home_earn_referral_button',
  '“Converted to USD” labels on account details': 'account_details_currency_conversion_subheadings',
  'USD account explainer': 'usd_account_onboarding',
  'Redesigned account details screen': 'deposit_accounts_v2',
  'Selfie tips before ID check (v2)': 'idv_intro_tips_v2',
  'Mexican account for US signups': 'us_show_mxn_account',
  'Remove self-transfer option': 'remove_transfer_option',
  'Clearer transfer menu wording': 'transfer_menu_copy',
  '“Get a US account” before choosing country': 'pre_country_selection',
  'Cashback on the card tab': 'card_home_cashback',
  'CLABE “view details” as a button': 'mx_clabe_view_details_button',
  'Raise Mexico minimum deposit to 100 MXN': 'change_mxn_deposit_minimum_to_100',
  'Redesigned deposit account carousel': 'redesign_deposit_accounts_carousel',
  '“No physical card, add to Apple Pay” nudge': 'card_apple_pay_nudge',
  'Add money before seeing your card': 'card_empty_state_add_money_v2',
  'Copy-CLABE button on home (Mexico)': 'mx_home_clabe_deposit_card',
  'Apple Pay top-ups in Mexico': 'mx_apple_pay_international_cards',
  'Explainer before iOS tracking prompt': 'att_primer_screen',
  'Transfers tab instead of floating button': 'move_fab_into_tab_bar',
  'Minimum deposit warning (Mexico)': 'mx_clabe_minimum_payment_copy_warning',
  'New push permission screen': 'push_opt_in_v2',
  'Exchange rate on home screen': 'exchange_rate_on_home_screen',
  '“Buy dollars” button': 'buy_dollars_2',
  'Push prompt on app launch': 'show_push_notification_prompt_onstartup',
  '“Add money” prompt after signup': 'signup_done_add_money_cta',
  'Invite link in the home feed': 'share_invite_link_on_home_feed',
  'Why-we-need-your-ID copy': 'idv_copy_change',
  'Push request after SMS step': 'notification_permission_after_sending_sms',
};

export function getStatsigUrl(name: string) {
  const slug = experimentSlugs[name];
  return slug
    ? `https://console.statsig.com/${STATSIG_PROJECT}/experiments/${slug}/`
    : `https://console.statsig.com/${STATSIG_PROJECT}/experiments/`;
}
