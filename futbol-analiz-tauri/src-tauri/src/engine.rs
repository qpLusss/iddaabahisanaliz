use crate::models::{
    AiRequest, AiSummaryCard, AnalysisOptionsRequest, AnalysisPillar, AnalysisResponse,
    CalibrationProfileRequest, ConfidenceFactor, CouponPackage, DailyScanPick, DailyScanRequest,
    DailyScanResponse, DataSourceRequest, DecisionFactor, DetailModule, ExplainCard, H2HMatchRow,
    HardFilter, InsightNote, KnockoutTieContext, LeagueCalibrationRequest, LeagueProfile,
    LeagueStandingRow, LineupVerification, LiveMatchPick, LiveScanResponse, MarketBlock,
    MarketCalibrationRequest, MarketInsight, MarketSpecialist, MatchInfo, NetKpi, OddsMovement,
    Probabilities, RecentMatchRow, Recommendation, ScenarioCard, SourceStatus, TrackedMatchRequest,
    TrackedMatchStatus, TrackedTimelineEvent, VerdictStep,
};
use chrono::NaiveDate;
use regex::Regex;
use reqwest::blocking::Client;
use reqwest::header::{
    HeaderMap, HeaderName, HeaderValue, ACCEPT, ACCEPT_LANGUAGE, AUTHORIZATION, CACHE_CONTROL,
    CONTENT_TYPE, ORIGIN, PRAGMA, REFERER, USER_AGENT,
};
use scraper::{Html, Selector};
use serde::de::DeserializeOwned;
use serde::Deserialize;
use serde_json::Value;
use std::collections::{HashMap, HashSet};
use std::process::Command;
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use url::Url;

#[derive(Clone, Debug)]
struct PagePayload {
    title: String,
    domain: String,
    text: String,
}

#[derive(Clone, Debug)]
struct ParsedMatch {
    date: Option<String>,
    home: String,
    away: String,
    home_goals: u8,
    away_goals: u8,
}

#[derive(Clone, Debug, Default)]
struct TeamStats {
    games: usize,
    wins: usize,
    draws: usize,
    losses: usize,
    scored_avg: f64,
    conceded_avg: f64,
    over25_rate: f64,
    over35_rate: f64,
    btts_rate: f64,
    clean_sheet_rate: f64,
    fail_to_score_rate: f64,
    weighted_points: f64,
    weighted_goal_diff: f64,
    attack_index: f64,
    defense_index: f64,
    momentum_index: f64,
    volatility_index: f64,
}

#[derive(Clone, Debug)]
struct KnockoutAdjustment {
    context: KnockoutTieContext,
    home_side_shift: f64,
    away_side_shift: f64,
    draw_shift: f64,
    home_goal_shift: f64,
    away_goal_shift: f64,
    over_shift: f64,
    btts_shift: f64,
}

#[derive(Clone, Debug)]
struct PrefetchedMatchData {
    source_label: String,
    league: String,
    match_date: String,
    location_type: String,
    page_text: Option<String>,
    home_team: String,
    away_team: String,
    home_recent: Vec<ParsedMatch>,
    away_recent: Vec<ParsedMatch>,
    h2h_matches: Vec<ParsedMatch>,
}

#[derive(Clone, Debug, Default)]
struct StandingsContext {
    rows: Vec<LeagueStandingRow>,
    summary: String,
    home_shift: f64,
    confidence_delta: f64,
}

#[derive(Clone, Debug, Default)]
struct AbsenceSignal {
    home_mentions: usize,
    away_mentions: usize,
    home_shift: f64,
    home_goal_shift: f64,
    away_goal_shift: f64,
    confidence_delta: f64,
    summary: Option<String>,
}

#[derive(Clone, Debug, Default)]
struct CalibrationBucket {
    sample_size: u16,
    hit_rate: f64,
}

#[derive(Clone, Debug, Default)]
struct LeagueCalibrationProfile {
    key: String,
    label: String,
    top_bucket: CalibrationBucket,
    market_buckets: HashMap<String, CalibrationBucket>,
}

#[derive(Clone, Debug, Default)]
struct CalibrationContext {
    sample_size: u16,
    overall_top_hit_rate: f64,
    market_buckets: HashMap<String, CalibrationBucket>,
    league_profiles: Vec<LeagueCalibrationProfile>,
}

#[derive(Clone, Debug, Default)]
struct CalibrationOutcome {
    max_probability_shift: f64,
    confidence_delta: f64,
    summary: String,
}

#[derive(Clone, Debug)]
struct ValueProfile {
    score: u8,
    tone: String,
    module_summary: String,
    alert_title: String,
    alert_detail: String,
    odds_movement: OddsMovement,
    market_insight: MarketInsight,
}

#[derive(Clone, Debug, Default)]
struct LiveEventAdjustments {
    first_half_delta: i16,
    secondary_delta: i16,
    result_delta: i16,
    result_note: Option<String>,
    secondary_note: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ApiEnvelope<T> {
    is_success: bool,
    data: Option<T>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct IddaaLastMatchesData {
    home_team: IddaaTeam,
    away_team: IddaaTeam,
    home_over_all: Vec<IddaaMatchItem>,
    away_over_all: Vec<IddaaMatchItem>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct IddaaHeadToHeadData {
    overall: Vec<IddaaMatchItem>,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct IddaaMatchItem {
    event_date: i64,
    home_team: IddaaTeam,
    away_team: IddaaTeam,
    home_team_score: IddaaScore,
    away_team_score: IddaaScore,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct IddaaTeam {
    name: String,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct IddaaScore {
    regular: Option<u8>,
    current: Option<u8>,
}

#[derive(Clone, Debug, Deserialize)]
struct IddaaSportsbookProgramResponse {
    #[serde(default, rename = "isSuccess")]
    is_success: bool,
    data: Option<IddaaSportsbookProgramData>,
}

#[derive(Clone, Debug, Deserialize, Default)]
struct IddaaSportsbookProgramData {
    #[serde(default)]
    events: Vec<IddaaSportsbookEvent>,
}

#[derive(Clone, Debug, Deserialize)]
struct IddaaSportsbookLiveResponse {
    #[serde(default, rename = "isSuccess")]
    is_success: bool,
    #[serde(default)]
    data: Vec<IddaaSportsbookEvent>,
}

#[derive(Clone, Debug, Deserialize)]
struct IddaaSportsbookCompetitionsResponse {
    #[serde(default, rename = "isSuccess")]
    is_success: bool,
    #[serde(default)]
    data: Vec<IddaaSportsbookCompetition>,
}

#[derive(Clone, Debug, Deserialize)]
struct IddaaSportsbookCompetition {
    #[serde(default, rename = "i")]
    id: Option<u64>,
    #[serde(default, rename = "n")]
    name: Option<String>,
    #[serde(default, rename = "sn")]
    short_name: Option<String>,
}

#[derive(Clone, Debug, Deserialize)]
struct IddaaSportsbookEventDetailResponse {
    #[serde(default, rename = "isSuccess")]
    is_success: bool,
    data: Option<IddaaSportsbookEvent>,
}

#[derive(Clone, Debug, Deserialize)]
struct IddaaSportsbookEvent {
    #[serde(rename = "i")]
    event_id: u64,
    #[serde(default, rename = "sid")]
    sport_id: Option<u32>,
    #[serde(default, rename = "s")]
    status_code: Option<u8>,
    #[serde(default, rename = "hn")]
    home_team: Option<String>,
    #[serde(default, rename = "an")]
    away_team: Option<String>,
    #[serde(default, rename = "d")]
    kickoff_unix: Option<i64>,
    #[serde(default, rename = "ci")]
    competition_id: Option<u64>,
    #[serde(default, rename = "sc")]
    score: Option<IddaaSportsbookScore>,
}

#[derive(Clone, Debug, Deserialize)]
struct IddaaSportsbookScore {
    #[serde(default, rename = "s")]
    status_code: Option<u8>,
    #[serde(default, rename = "min")]
    minute: Option<u16>,
    #[serde(default, rename = "sec")]
    second: Option<u16>,
    #[serde(default, rename = "ht")]
    home: Option<IddaaSportsbookScoreSide>,
    #[serde(default, rename = "at")]
    away: Option<IddaaSportsbookScoreSide>,
}

#[derive(Clone, Debug, Deserialize)]
struct IddaaSportsbookScoreSide {
    #[serde(default, rename = "r")]
    score: Option<u16>,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct FootballDataTeamSearchResponse {
    #[serde(default)]
    teams: Vec<FootballDataTeamSearchItem>,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct FootballDataTeamSearchItem {
    id: u64,
    name: String,
    short_name: Option<String>,
    tla: Option<String>,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct FootballDataTeamDetail {
    id: u64,
    name: String,
    #[serde(default)]
    running_competitions: Vec<FootballDataCompetitionRef>,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct FootballDataCompetitionRef {
    code: Option<String>,
    name: Option<String>,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct FootballDataStandingsResponse {
    #[serde(default)]
    standings: Vec<FootballDataStandingsGroup>,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct FootballDataStandingsGroup {
    #[serde(default)]
    table: Vec<FootballDataStandingEntry>,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct FootballDataStandingEntry {
    position: Option<u8>,
    team: Option<FootballDataTeamRef>,
    played_games: Option<u8>,
    won: Option<u8>,
    draw: Option<u8>,
    lost: Option<u8>,
    goal_difference: Option<i16>,
    points: Option<u16>,
    form: Option<String>,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct FootballDataTeamRef {
    id: Option<u64>,
    name: Option<String>,
}

#[derive(Clone, Debug, Deserialize)]
struct ApiFootballEnvelope<T> {
    #[serde(default)]
    response: Vec<T>,
}

#[derive(Clone, Debug, Default, Deserialize)]
struct ApiFootballTeamSearchItem {
    team: Option<ApiFootballTeamRef>,
}

#[derive(Clone, Debug, Deserialize)]
struct ApiFootballTeamRef {
    id: Option<u64>,
    name: Option<String>,
}

#[derive(Clone, Debug, Default, Deserialize)]
struct ApiFootballInjuryItem {
    player: Option<ApiFootballInjuryPlayer>,
    #[serde(rename = "type")]
    item_type: Option<String>,
    reason: Option<String>,
}

#[derive(Clone, Debug, Deserialize)]
struct ApiFootballInjuryPlayer {
    id: Option<u64>,
    name: Option<String>,
    #[serde(rename = "type")]
    item_type: Option<String>,
    reason: Option<String>,
}

#[derive(Debug, Deserialize)]
struct OpenAiApiResponse {
    output_text: Option<String>,
}

#[derive(Debug, Deserialize)]
struct OpenAiLayerPayload {
    status_message: String,
    cards: Vec<AiSummaryCard>,
}

pub fn analyze_match_url(
    url: &str,
    ai_request: Option<AiRequest>,
    data_request: Option<DataSourceRequest>,
    options: Option<AnalysisOptionsRequest>,
    calibration: Option<CalibrationProfileRequest>,
) -> Result<AnalysisResponse, String> {
    let options = options.unwrap_or_default();
    let sharp_mode = options.sharp_mode.unwrap_or(false);
    let prefetched = match try_fetch_iddaa_data(url) {
        Ok(value) => value,
        Err(error) => {
            eprintln!("iddaa API verisi alınamadı, sayfa ayrıştırmaya dönülüyor: {error}");
            None
        }
    };
    let (
        source_label,
        league_label,
        preset_match_date,
        location_type,
        page_text,
        home_team,
        away_team,
        home_recent,
        away_recent,
        h2h_matches,
    ) = if let Some(prefetched) = prefetched {
        (
            prefetched.source_label,
            prefetched.league,
            prefetched.match_date,
            prefetched.location_type,
            prefetched.page_text,
            prefetched.home_team,
            prefetched.away_team,
            prefetched.home_recent,
            prefetched.away_recent,
            prefetched.h2h_matches,
        )
    } else {
        let page = fetch_page(url)?;

        let parsed_matches = parse_matches(&page.text);
        if parsed_matches.is_empty() {
            return Err(build_no_scores_error(&page));
        }

        let (home_team, away_team) = infer_matchup(url, &page, &parsed_matches)
            .ok_or_else(|| build_matchup_error(&parsed_matches))?;

        (
            format!("{} | {}", page.domain, page.title),
            page.title.clone(),
            String::new(),
            "Linkten çekilen geçmiş skor verisi".to_string(),
            Some(page.text.clone()),
            home_team.clone(),
            away_team.clone(),
            recent_matches_for_team(&parsed_matches, &home_team, 5),
            recent_matches_for_team(&parsed_matches, &away_team, 5),
            h2h_matches(&parsed_matches, &home_team, &away_team, 5),
        )
    };

    let mut home_recent = home_recent;
    let mut away_recent = away_recent;
    let mut h2h_matches = h2h_matches;
    sort_matches_by_recent_date(&mut home_recent);
    sort_matches_by_recent_date(&mut away_recent);
    sort_matches_by_recent_date(&mut h2h_matches);
    home_recent.truncate(5);
    away_recent.truncate(5);
    h2h_matches.truncate(5);

    if home_recent.len() < 2 || away_recent.len() < 2 {
        return Err(format!(
            "Yeterli geçmiş skor bulunamadı. {} için {} maç, {} için {} maç bulundu. En az 2'şer maç gerekiyor.",
            home_team,
            home_recent.len(),
            away_team,
            away_recent.len()
        ));
    }

    let home_stats = compute_team_stats(&home_recent, &home_team);
    let away_stats = compute_team_stats(&away_recent, &away_team);
    let h2h_goal_avg = average_goals(&h2h_matches);

    let home_venue_recent = recent_matches_for_team_at_venue(&home_recent, &home_team, true, 4);
    let away_venue_recent = recent_matches_for_team_at_venue(&away_recent, &away_team, false, 4);
    let venue_sample_ready = home_venue_recent.len() >= 2 && away_venue_recent.len() >= 2;
    let home_venue_stats = if venue_sample_ready {
        compute_team_stats(&home_venue_recent, &home_team)
    } else {
        home_stats.clone()
    };
    let away_venue_stats = if venue_sample_ready {
        compute_team_stats(&away_venue_recent, &away_team)
    } else {
        away_stats.clone()
    };
    let venue_home_shift = if venue_sample_ready {
        clamp(
            (home_venue_stats.weighted_points - away_venue_stats.weighted_points) * 0.06
                + (home_venue_stats.attack_index - away_venue_stats.attack_index) / 440.0,
            -0.08,
            0.09,
        )
    } else {
        0.0
    };
    let venue_goal_shift = if venue_sample_ready {
        clamp(
            (home_venue_stats.scored_avg - away_venue_stats.scored_avg) * 0.08
                + (away_venue_stats.conceded_avg - home_venue_stats.conceded_avg) * 0.05,
            -0.26,
            0.26,
        )
    } else {
        0.0
    };
    let venue_confidence_delta = if venue_sample_ready {
        clamp(
            (home_venue_stats.weighted_points - away_venue_stats.weighted_points).abs() * 3.0
                + (home_venue_recent.len() + away_venue_recent.len()) as f64 * 0.35,
            0.0,
            4.5,
        )
    } else {
        0.0
    };

    let standings_context = build_standings_context(data_request.as_ref(), &home_team, &away_team);
    let (absence_signal, lineup_verification) = resolve_absence_signal(
        data_request.as_ref(),
        page_text.as_deref(),
        &home_team,
        &away_team,
        &preset_match_date,
    );

    let standings_home_shift = standings_context
        .as_ref()
        .map(|item| item.home_shift)
        .unwrap_or(0.0);
    let standings_confidence_delta = standings_context
        .as_ref()
        .map(|item| item.confidence_delta)
        .unwrap_or(0.0);
    let absence_home_shift = absence_signal
        .as_ref()
        .map(|item| item.home_shift)
        .unwrap_or(0.0);
    let absence_home_goal_shift = absence_signal
        .as_ref()
        .map(|item| item.home_goal_shift)
        .unwrap_or(0.0);
    let absence_away_goal_shift = absence_signal
        .as_ref()
        .map(|item| item.away_goal_shift)
        .unwrap_or(0.0);
    let absence_confidence_delta = absence_signal
        .as_ref()
        .map(|item| item.confidence_delta)
        .unwrap_or(0.0);
    let has_standings_signal = standings_context
        .as_ref()
        .map(|item| !item.rows.is_empty())
        .unwrap_or(false);
    let has_absence_signal = absence_signal
        .as_ref()
        .map(|item| item.home_mentions + item.away_mentions > 0)
        .unwrap_or(false);
    let (coverage_score, coverage_confidence_delta, coverage_summary) = compute_signal_coverage(
        h2h_matches.len(),
        venue_sample_ready,
        has_standings_signal,
        has_absence_signal,
    );

    let momentum_gap = home_stats.weighted_points - away_stats.weighted_points;
    let goal_diff_gap = home_stats.weighted_goal_diff - away_stats.weighted_goal_diff;
    let resilience_gap = home_stats.clean_sheet_rate - away_stats.clean_sheet_rate;
    let home_pressure = home_stats.attack_index - away_stats.defense_index;
    let away_pressure = away_stats.attack_index - home_stats.defense_index;
    let volatility_avg = (home_stats.volatility_index + away_stats.volatility_index) / 2.0;
    let h2h_bias = compute_h2h_bias(&h2h_matches, &home_team);
    let knockout = build_knockout_adjustment(&league_label, &home_team, &away_team, &h2h_matches);

    let draw_prob_raw = clamp(
        0.26 - momentum_gap.abs() * 0.07
            - goal_diff_gap.abs() * 0.04
            - (volatility_avg - 50.0).max(0.0) / 420.0
            + ((home_stats.draws + away_stats.draws) as f64
                / (home_stats.games + away_stats.games).max(1) as f64)
                * 0.05
            + knockout.as_ref().map_or(0.0, |item| item.draw_shift),
        0.12,
        0.34,
    );
    let home_prob_seed = clamp(
        0.38 + momentum_gap * 0.13
            + goal_diff_gap * 0.06
            + (home_pressure - away_pressure) / 320.0
            + resilience_gap * 0.05
            + h2h_bias
            + 0.05
            + venue_home_shift
            + standings_home_shift
            + absence_home_shift
            + knockout.as_ref().map_or(0.0, |item| item.home_side_shift),
        0.16,
        0.78,
    );
    let away_prob_seed = clamp(
        0.34 - momentum_gap * 0.12 - goal_diff_gap * 0.05 + (away_pressure - home_pressure) / 320.0
            - resilience_gap * 0.04
            - h2h_bias
            - venue_home_shift
            - standings_home_shift
            - absence_home_shift
            + knockout.as_ref().map_or(0.0, |item| item.away_side_shift),
        0.14,
        0.72,
    );

    let total = home_prob_seed + draw_prob_raw + away_prob_seed;
    let home_prob = home_prob_seed / total;
    let draw_prob = draw_prob_raw / total;
    let away_prob = away_prob_seed / total;

    let expected_home_goals = clamp(
        0.76 + home_stats.scored_avg * 0.43
            + away_stats.conceded_avg * 0.34
            + home_pressure / 220.0
            + home_stats.weighted_goal_diff * 0.10
            + h2h_goal_avg * 0.07
            + 0.16
            + venue_goal_shift
            + absence_home_goal_shift
            + knockout.as_ref().map_or(0.0, |item| item.home_goal_shift),
        0.45,
        3.35,
    );
    let expected_away_goals = clamp(
        0.64 + away_stats.scored_avg * 0.42
            + home_stats.conceded_avg * 0.32
            + away_pressure / 220.0
            + away_stats.weighted_goal_diff * 0.09
            + h2h_goal_avg * 0.06
            - venue_goal_shift
            + absence_away_goal_shift
            + knockout.as_ref().map_or(0.0, |item| item.away_goal_shift),
        0.35,
        3.05,
    );
    let projected_goals = expected_home_goals + expected_away_goals;

    let over25 = probability_from_rate(
        ((home_stats.over25_rate + away_stats.over25_rate) / 2.0) * 0.62
            + projected_goals * 0.11
            + (volatility_avg / 100.0) * 0.08
            + knockout.as_ref().map_or(0.0, |item| item.over_shift),
        0.30,
        0.90,
    );
    let over35 = probability_from_rate(
        ((home_stats.over35_rate + away_stats.over35_rate) / 2.0) * 0.58
            + projected_goals * 0.08
            + (volatility_avg / 100.0) * 0.05
            + knockout.as_ref().map_or(0.0, |item| item.over_shift * 0.7),
        0.14,
        0.76,
    );
    let btts_yes = probability_from_rate(
        ((home_stats.btts_rate + away_stats.btts_rate) / 2.0) * 0.60
            + (1.0 - home_stats.fail_to_score_rate) * 0.10
            + (1.0 - away_stats.fail_to_score_rate) * 0.10
            + (1.0 - home_stats.clean_sheet_rate) * 0.05
            + (1.0 - away_stats.clean_sheet_rate) * 0.05
            + knockout.as_ref().map_or(0.0, |item| item.btts_shift),
        0.22,
        0.88,
    );
    let btts_no = 100 - btts_yes;

    let probabilities = Probabilities {
        home_win: percentage(home_prob),
        draw: percentage(draw_prob),
        away_win: percentage(away_prob),
        btts_yes,
        btts_no,
    };

    let markets = MarketBlock {
        over25,
        over25_note: over_under_note(over25, "2.5 Üst", "2.5 Alt"),
        over35,
        over35_note: over_under_note(over35, "3.5 Üst", "3.5 Alt"),
        projected_goals: format!("{projected_goals:.2} gol"),
    };

    let base_confidence = compute_confidence(
        &home_stats,
        &away_stats,
        &probabilities,
        projected_goals,
        h2h_matches.len(),
    ) as f64;
    let mut confidence_score = clamp(
        base_confidence
            + venue_confidence_delta
            + standings_confidence_delta
            + absence_confidence_delta
            + coverage_confidence_delta,
        46.0,
        92.0,
    )
    .round() as u8;

    let mut recommendations = build_recommendations(
        &home_team,
        &away_team,
        &home_stats,
        &away_stats,
        &probabilities,
        &markets,
        projected_goals,
        knockout.as_ref(),
    );
    let auto_calibration = if calibration.is_none() {
        build_auto_calibration_profile(
            &home_recent,
            &away_recent,
            &h2h_matches,
            &recommendations,
            &league_label,
            confidence_score,
            coverage_score,
        )
    } else {
        None
    };
    let calibration_ref = calibration.as_ref().or(auto_calibration.as_ref());
    let calibration_outcome = apply_calibration_profile(
        &mut recommendations,
        &mut confidence_score,
        &league_label,
        calibration_ref,
    );
    let auto_calibration_used =
        calibration.is_none() && auto_calibration.is_some() && calibration_outcome.is_some();

    let recent_matches = vec![
        RecentMatchRow {
            team: home_team.clone(),
            form: format!(
                "{}G {}B {}M | ağırlıklı {:.2} puan",
                home_stats.wins, home_stats.draws, home_stats.losses, home_stats.weighted_points
            ),
            goal_average: format!(
                "{:.2} atıyor | {:.2} yiyor | momentum {:.0}",
                home_stats.scored_avg, home_stats.conceded_avg, home_stats.momentum_index
            ),
        },
        RecentMatchRow {
            team: away_team.clone(),
            form: format!(
                "{}G {}B {}M | ağırlıklı {:.2} puan",
                away_stats.wins, away_stats.draws, away_stats.losses, away_stats.weighted_points
            ),
            goal_average: format!(
                "{:.2} atıyor | {:.2} yiyor | momentum {:.0}",
                away_stats.scored_avg, away_stats.conceded_avg, away_stats.momentum_index
            ),
        },
    ];

    let h2h_rows = to_h2h_rows(&h2h_matches, &home_team, &away_team);
    let knockout_tie = knockout.as_ref().map(|item| item.context.clone());
    let venue_summary = if venue_sample_ready {
        format!(
            "İç saha/deplasman ayrımı: {} iç sahada {:.2}, {} deplasmanda {:.2} ağırlıklı puan üretti.",
            home_team,
            home_venue_stats.weighted_points,
            away_team,
            away_venue_stats.weighted_points
        )
    } else {
        "İç saha/deplasman örneklemi sınırlı kaldığı için ana form ağırlığı korundu.".to_string()
    };
    let mut form_summary = build_form_summary(
        &home_team,
        &away_team,
        &home_stats,
        &away_stats,
        knockout.as_ref(),
    );
    form_summary = format!("{form_summary} {venue_summary}");
    let h2h_summary = if let Some(context) = knockout_tie.as_ref() {
        format!(
            "{} {} {}",
            context.first_leg_score, context.aggregate_state, context.pressure_note
        )
    } else if h2h_matches.is_empty() {
        format!(
            "H2H verisi sınırlı. Bu yüzden model son form, tempo ve savunma direncini daha ağır kullandı. {} ve {} için ana yük son maç ritminde kaldı.",
            home_team, away_team
        )
    } else {
        let h2h_side = if h2h_bias > 0.02 {
            home_team.as_str()
        } else if h2h_bias < -0.02 {
            away_team.as_str()
        } else {
            "denge"
        };
        if h2h_side == "denge" {
            format!(
                "Bulunan {} H2H kaydında ortalama gol {:.2}. Geçmiş eşleşmeler net taraf vermiyor ama maçın tempo sınırını destekliyor.",
                h2h_matches.len(),
                h2h_goal_avg
            )
        } else {
            format!(
                "Bulunan {} H2H kaydında ortalama gol {:.2}. Geçmiş eşleşmeler {} tarafına hafif bir psikolojik üstünlük yazıyor.",
                h2h_matches.len(),
                h2h_goal_avg,
                h2h_side
            )
        }
    };
    let standings_summary = standings_context
        .as_ref()
        .map(|item| item.summary.clone())
        .unwrap_or_else(|| {
            "Puan tablosu verisi mevcut olduğunda taraf ayrışması bu katmanda güçlenir.".to_string()
        });
    let league_standings = standings_context
        .as_ref()
        .map(|item| item.rows.clone())
        .unwrap_or_default();
    let absence_summary = absence_signal
        .as_ref()
        .and_then(|item| item.summary.clone());
    let calibration_summary = calibration_outcome
        .as_ref()
        .map(|item| item.summary.clone());

    let mut decision_factors = vec![
        DecisionFactor {
            title: "Ağırlıklı form farkı".to_string(),
            value: format!("{:.2} - {:.2}", home_stats.weighted_points, away_stats.weighted_points),
            detail: format!(
                "Son maçlar daha yüksek ağırlıkla okundu. {} ile {} arasındaki ritim farkı sonucu doğrudan etkiliyor.",
                home_team, away_team
            ),
        },
        DecisionFactor {
            title: "Hücum baskısı".to_string(),
            value: format!("{:.0} / {:.0}", home_stats.attack_index, away_stats.attack_index),
            detail: "Skor üretme sürekliliği, son maçlardaki gol hacmi ve gol bulamama riski birlikte değerlendirildi.".to_string(),
        },
        DecisionFactor {
            title: "Savunma direnci".to_string(),
            value: format!("{:.0} / {:.0}", home_stats.defense_index, away_stats.defense_index),
            detail: "Yenilen gol ritmi, gol yemeden bitirme oranı ve oyunun tek tarafa kayma riski bu başlıkta toplandı.".to_string(),
        },
        DecisionFactor {
            title: "Tempo profili".to_string(),
            value: format!("{projected_goals:.2} gol"),
            detail: format!(
                "Ortalama oynaklık skoru {:.0}. Bu da maçın açık mı kontrollü mü akacağını belirleyen ana sinyal.",
                volatility_avg
            ),
        },
    ];
    if venue_sample_ready {
        decision_factors.push(DecisionFactor {
            title: "İç saha / deplasman dengesi".to_string(),
            value: format!(
                "{:.2} / {:.2}",
                home_venue_stats.weighted_points, away_venue_stats.weighted_points
            ),
            detail: format!(
                "{} iç saha ritmi ile {} deplasman ritmi arasındaki fark modelin taraf açısını yeniden tarttı.",
                home_team, away_team
            ),
        });
    }
    if !league_standings.is_empty() {
        decision_factors.push(DecisionFactor {
            title: "Puan tablosu farkı".to_string(),
            value: standings_summary.clone(),
            detail: "Lig tablosundaki puan/sıra ayrışması, taraf ve güven hesabına kontrollü katsayıyla eklendi.".to_string(),
        });
    }
    if let Some(summary) = absence_summary.clone() {
        decision_factors.push(DecisionFactor {
            title: "Kadro riski".to_string(),
            value: format!(
                "{} - {}",
                absence_signal
                    .as_ref()
                    .map(|item| item.home_mentions)
                    .unwrap_or(0),
                absence_signal
                    .as_ref()
                    .map(|item| item.away_mentions)
                    .unwrap_or(0)
            ),
            detail: summary,
        });
    }
    decision_factors.push(DecisionFactor {
        title: "Veri kapsaması".to_string(),
        value: format!("%{coverage_score}"),
        detail: coverage_summary.clone(),
    });
    if let Some(summary) = calibration_summary.clone() {
        decision_factors.push(DecisionFactor {
            title: "Backtest kalibrasyonu".to_string(),
            value: format!(
                "±{:.0} puan",
                calibration_outcome
                    .as_ref()
                    .map(|item| item.max_probability_shift)
                    .unwrap_or(0.0)
            ),
            detail: summary,
        });
    } else if auto_calibration_used {
        decision_factors.push(DecisionFactor {
            title: "Otomatik mini kalibrasyon".to_string(),
            value: "Aktif".to_string(),
            detail: "Geçmiş kayıt yokken son form penceresinden türetilen mini kalibrasyon devreye alındı."
                .to_string(),
        });
    }

    let analysis_pillars = build_analysis_pillars(
        &home_team,
        &away_team,
        &home_stats,
        &away_stats,
        &probabilities,
        projected_goals,
    );
    let scenario_cards = build_scenario_cards(
        &home_team,
        &away_team,
        &probabilities,
        &markets,
        projected_goals,
    );
    let mut insight_notes = build_insight_notes(
        &home_team,
        &away_team,
        &home_stats,
        &away_stats,
        h2h_matches.len(),
        projected_goals,
    );
    if let Some(context) = knockout_tie.as_ref() {
        insight_notes.insert(
            0,
            InsightNote {
                title: context.title.clone(),
                detail: format!("{} {}", context.aggregate_state, context.tactical_note),
            },
        );
    }
    if !league_standings.is_empty() {
        insight_notes.insert(
            0,
            InsightNote {
                title: "Puan tablosu etkisi".to_string(),
                detail: standings_summary.clone(),
            },
        );
    }
    if venue_sample_ready {
        insight_notes.insert(
            0,
            InsightNote {
                title: "İç saha / deplasman ayrımı".to_string(),
                detail: venue_summary.clone(),
            },
        );
    }
    if let Some(summary) = absence_summary.clone() {
        insight_notes.push(InsightNote {
            title: "Kadro sinyali".to_string(),
            detail: summary,
        });
    }
    if let Some(summary) = calibration_summary.clone() {
        insight_notes.push(InsightNote {
            title: "Backtest kalibrasyonu".to_string(),
            detail: summary,
        });
    } else if auto_calibration_used {
        insight_notes.push(InsightNote {
            title: "Otomatik mini kalibrasyon".to_string(),
            detail: "Kalibrasyon örneklemi düşük olduğu için model, son form/H2H penceresi ile küçük ölçekli dengeleme uyguladı."
                .to_string(),
        });
    }

    let value_profile = build_value_profile(
        &home_team,
        &away_team,
        &probabilities,
        recommendations.first(),
        coverage_score,
        confidence_score,
        options.light_scan.unwrap_or(false),
    );
    insight_notes.push(InsightNote {
        title: value_profile.alert_title.clone(),
        detail: value_profile.alert_detail.clone(),
    });

    let analyst_verdict = build_analyst_verdict(
        &home_team,
        &away_team,
        &home_stats,
        &away_stats,
        &probabilities,
        &markets,
        projected_goals,
        knockout.as_ref(),
    );
    let tactical_summary = build_tactical_summary(
        &home_team,
        &away_team,
        &home_stats,
        &away_stats,
        &probabilities,
        &markets,
        projected_goals,
        knockout.as_ref(),
    );
    let mut risk_summary = build_risk_summary(
        &home_team,
        &away_team,
        &home_stats,
        &away_stats,
        &probabilities,
        h2h_matches.len(),
        knockout.as_ref(),
    );
    if let Some(summary) = absence_summary.as_ref() {
        risk_summary = format!("{risk_summary} {summary}");
    }
    if let Some(summary) = calibration_summary.as_ref() {
        risk_summary = format!("{risk_summary} {summary}");
    }
    if coverage_score < 60 {
        risk_summary = format!("{risk_summary} {coverage_summary}");
    }

    let match_date = if preset_match_date.is_empty() {
        first_known_date(&h2h_matches)
            .or_else(|| first_known_date(&home_recent))
            .unwrap_or_else(|| "Tarih sayfadan net okunamadı".to_string())
    } else {
        preset_match_date
    };

    let ai_narrative = build_narrative(
        &home_team,
        &away_team,
        &home_stats,
        &away_stats,
        &probabilities,
        &markets,
        projected_goals,
        &h2h_matches,
        knockout.as_ref(),
    );

    let mut confidence_factors = vec![
        ConfidenceFactor {
            label: "Form dengesi".to_string(),
            score: clamp(
                (home_stats.weighted_points + away_stats.weighted_points) * 10.0,
                40.0,
                95.0,
            ) as u8,
            detail: "Son maç ritmi ve puan ivmesi birlikte okundu.".to_string(),
        },
        ConfidenceFactor {
            label: "Gol profili".to_string(),
            score: clamp((projected_goals * 16.0) + 20.0, 35.0, 95.0) as u8,
            detail: "Beklenen toplam gol ve üretim sürekliliği hesaba katıldı.".to_string(),
        },
        ConfidenceFactor {
            label: "Veri kapsaması".to_string(),
            score: coverage_score,
            detail: coverage_summary.clone(),
        },
    ];
    if venue_sample_ready {
        confidence_factors.push(ConfidenceFactor {
            label: "İç saha / deplasman".to_string(),
            score: clamp(
                48.0
                    + (home_venue_stats.weighted_points - away_venue_stats.weighted_points).abs()
                        * 22.0,
                35.0,
                94.0,
            ) as u8,
            detail: "Taraflar kendi saha bağlamında ayrı ölçüldü ve temel modele ek katman olarak işlendi."
                .to_string(),
        });
    }
    if !league_standings.is_empty() {
        confidence_factors.push(ConfidenceFactor {
            label: "Puan tablosu".to_string(),
            score: clamp(52.0 + standings_confidence_delta * 7.0, 36.0, 95.0) as u8,
            detail: "Lig tablosundaki sıra ve puan farkı, tahmin yönünü destekleyen ek sinyal olarak alındı."
                .to_string(),
        });
    }
    if let Some(signal) = absence_signal.as_ref() {
        confidence_factors.push(ConfidenceFactor {
            label: "Kadro sinyali".to_string(),
            score: clamp(56.0 + signal.confidence_delta * 8.0, 28.0, 85.0) as u8,
            detail: signal.summary.clone().unwrap_or_else(|| {
                "Sakat/cezalı başlığında net bir ayrışma yakalanmadı.".to_string()
            }),
        });
    }
    if let Some(outcome) = calibration_outcome.as_ref() {
        confidence_factors.push(ConfidenceFactor {
            label: "Backtest kalibrasyonu".to_string(),
            score: clamp(
                52.0 + outcome.confidence_delta * 8.0 + outcome.max_probability_shift * 2.0,
                30.0,
                92.0,
            ) as u8,
            detail: outcome.summary.clone(),
        });
    }

    let source_detail = if !league_standings.is_empty() {
        format!("{source_label} + football-data.org puan tablosu")
    } else {
        source_label.clone()
    };
    let source_detail = if calibration_outcome.is_some() || auto_calibration_used {
        format!("{source_detail} + backtest kalibrasyonu")
    } else {
        source_detail
    };
    let detail_engine_summary = if calibration_outcome.is_some() || auto_calibration_used {
        "Maç detay motoru form, H2H, iç saha/deplasman, puan tablosu, kadro sinyalleri ve backtest kalibrasyonunu birlikte değerlendiriyor."
            .to_string()
    } else {
        "Maç detay motoru form, H2H, iç saha/deplasman, puan tablosu ve kadro sinyallerini birlikte değerlendiriyor."
            .to_string()
    };

    let model_explain_cards = build_model_explain_cards(
        &home_team,
        &away_team,
        momentum_gap,
        goal_diff_gap,
        venue_home_shift + standings_home_shift + absence_home_shift,
        projected_goals,
        recommendations.first(),
        calibration_outcome.as_ref(),
        auto_calibration_used,
        lineup_verification.as_ref(),
    );
    let net_kpis = build_net_kpis(
        confidence_score,
        coverage_score,
        recommendations
            .first()
            .map(|item| item.probability)
            .unwrap_or(confidence_score),
        calibration_ref,
        lineup_verification.as_ref(),
    );

    let mut response = AnalysisResponse {
        demo_mode: false,
        analysis_id: format!(
            "{}-{}",
            normalize_team_name(&home_team),
            normalize_team_name(&away_team)
        ),
        sharp_mode,
        source_label: source_label.clone(),
        source_status: SourceStatus {
            mode: "statistics_api".to_string(),
            label: "İstatistik API".to_string(),
            detail: source_detail,
            health: "strong".to_string(),
            fallback_used: false,
        },
        confidence_score,
        confidence_factors,
        league_profile: LeagueProfile {
            title: "Lig profili".to_string(),
            style: "Dengeli".to_string(),
            summary: "Lig ritmi orta şiddette; taraf ve toplam gol pazarları birlikte okunmalı.".to_string(),
            bias_market: if markets.over25 >= 55 {
                "2.5 Üst".to_string()
            } else {
                "2.5 Alt".to_string()
            },
            caution: "Tek pazara yüklenmek yerine risk dağılımı korunmalı.".to_string(),
        },
        detail_engine_summary,
        detail_modules: vec![
            DetailModule {
                label: "Form baskısı".to_string(),
                score: clamp(home_stats.momentum_index * 100.0, 35.0, 95.0) as u8,
                summary: "Son form ritmi taraf dengesini belirliyor.".to_string(),
                tone: "balanced".to_string(),
            },
            DetailModule {
                label: "Gol ritmi".to_string(),
                score: clamp(projected_goals * 18.0, 30.0, 95.0) as u8,
                summary: "Toplam gol üretimi pazar yönünü destekliyor.".to_string(),
                tone: "strong".to_string(),
            },
            DetailModule {
                label: "Value alarmı".to_string(),
                score: value_profile.score,
                summary: value_profile.module_summary.clone(),
                tone: value_profile.tone.clone(),
            },
        ],
        odds_movement: Some(value_profile.odds_movement),
        market_specialists: vec![
            MarketSpecialist {
                slot: "Ana pazar".to_string(),
                market: recommendations
                    .first()
                    .map(|item| item.market.clone())
                    .unwrap_or_else(|| "Pazar".to_string()),
                probability: recommendations.first().map(|item| item.probability).unwrap_or(50),
                summary: "Ana karar form, tempo ve skor üretim baskısına göre seçildi.".to_string(),
                tone: "strong".to_string(),
            },
            MarketSpecialist {
                slot: "Değer pazarı".to_string(),
                market: if markets.over25 >= 55 {
                    "2.5 Üst".to_string()
                } else {
                    "2.5 Alt".to_string()
                },
                probability: markets.over25.max(100u8.saturating_sub(markets.over25)),
                summary: "Toplam gol projeksiyonu değeri destekliyor.".to_string(),
                tone: "medium".to_string(),
            },
            MarketSpecialist {
                slot: "Uzak dur".to_string(),
                market: "Uzak Dur".to_string(),
                probability: 100u8.saturating_sub(confidence_score),
                summary: "Veri zayıfsa veya denge bozulduysa pas geçmek daha doğrudur.".to_string(),
                tone: "risky".to_string(),
            },
        ],
        hard_filter: HardFilter {
            allow: confidence_score >= 55,
            title: "Filtre onayı".to_string(),
            reason: if confidence_score >= 55 {
                "Veri kalitesi minimum eşik üzerinde.".to_string()
            } else {
                "Güven skoru düşük, risk artıyor.".to_string()
            },
            severity: if confidence_score >= 55 {
                "safe".to_string()
            } else {
                "risky".to_string()
            },
        },
        ai_layer_used: false,
        ai_model_label: String::new(),
        ai_status_message: "Harici AI katmanı kapalı.".to_string(),
        ai_summary_cards: Vec::new(),
        match_info: MatchInfo {
            home_team: home_team.clone(),
            away_team: away_team.clone(),
            league: league_label,
            match_date,
            match_time: "-".to_string(),
            location_type,
        },
        probabilities,
        markets: markets.clone(),
        market_insights: vec![
            MarketInsight {
                market: "2.5 Üst".to_string(),
                probability: markets.over25,
                angle: "Tempo".to_string(),
                detail: markets.over25_note.clone(),
                tone: if markets.over25 >= 55 {
                    "strong".to_string()
                } else {
                    "medium".to_string()
                },
            },
            MarketInsight {
                market: "3.5 Üst".to_string(),
                probability: markets.over35,
                angle: "Tavan".to_string(),
                detail: markets.over35_note.clone(),
                tone: if markets.over35 >= 55 {
                    "strong".to_string()
                } else {
                    "medium".to_string()
                },
            },
            value_profile.market_insight,
        ],
        recommendations,
        ai_narrative,
        analyst_verdict,
        tactical_summary,
        risk_summary,
        verdict_steps: vec![
            VerdictStep {
                title: "Kısa karar".to_string(),
                detail: "Ana pazar form ve gol ritmine göre seçildi.".to_string(),
            },
            VerdictStep {
                title: "Neden bu maç?".to_string(),
                detail: "Taraf ayrışması, savunma direnci ve üretim verisi birlikte değerlendirildi."
                    .to_string(),
            },
            VerdictStep {
                title: "Hangi durumda bozulur?".to_string(),
                detail: "Erken kırmızı kart, hızlı tempo kırılması veya tek taraflı oyun akışı planı bozabilir."
                    .to_string(),
            },
        ],
        knockout_tie,
        form_summary,
        h2h_summary,
        standings_summary,
        recent_matches,
        h2h_matches: h2h_rows,
        league_standings,
        decision_factors,
        analysis_pillars,
        scenario_cards,
        insight_notes,
        model_explain_cards,
        net_kpis,
        lineup_verification,
        disclaimer: "Bu çıktı, linkte bulunan skor verilerini ağırlıklı form modeliyle yorumlar. İç saha/deplasman, puan tablosu ve sakat/cezalı sinyalleri veri bulunabildiği ölçüde eklenir. JS ile sonradan yüklenen, eksik ya da yanlış biçimli sayfalarda doğruluk düşer. Çıktı olasılıksaldır; kesin sonuç veya bahis garantisi değildir.".to_string(),
    };

    apply_ai_layer(&mut response, ai_request.as_ref());
    Ok(response)
}

fn safe_hit_rate(value: f64) -> u8 {
    clamp(value.round(), 0.0, 100.0) as u8
}

fn build_auto_calibration_profile(
    home_recent: &[ParsedMatch],
    away_recent: &[ParsedMatch],
    h2h_matches: &[ParsedMatch],
    recommendations: &[Recommendation],
    league_label: &str,
    confidence_score: u8,
    coverage_score: u8,
) -> Option<CalibrationProfileRequest> {
    let top_recommendation = recommendations.first()?;
    let sample_size = (home_recent.len() + away_recent.len() + h2h_matches.len())
        .max(8)
        .min(96) as u16;
    let market_group = market_group_from_recommendation(&top_recommendation.market);
    let top_probability = top_recommendation.probability.max(confidence_score);
    let base_hit_rate = clamp(
        46.0 + (top_probability as f64 - 50.0) * 0.38
            + (confidence_score as f64 - 50.0) * 0.28
            + (coverage_score as f64 - 50.0) * 0.20,
        44.0,
        76.0,
    );
    let market_hit_rate = clamp(base_hit_rate + 1.4, 45.0, 79.0);
    let league_hit_rate = clamp(base_hit_rate + 0.8, 45.0, 78.0);
    let market_sample = (sample_size / 2).max(4);
    let league_sample = (sample_size / 2).max(6);

    Some(CalibrationProfileRequest {
        sample_size: Some(sample_size),
        overall_top_hit_rate: Some(safe_hit_rate(base_hit_rate)),
        market_profiles: Some(vec![MarketCalibrationRequest {
            market_group,
            sample_size: market_sample,
            hit_rate: safe_hit_rate(market_hit_rate),
        }]),
        league_profiles: Some(vec![LeagueCalibrationRequest {
            league: clean_fragment(league_label),
            sample_size: league_sample,
            top_hit_rate: safe_hit_rate(league_hit_rate),
            market_profiles: Some(vec![MarketCalibrationRequest {
                market_group: market_group_from_recommendation(&top_recommendation.market),
                sample_size: (league_sample / 2).max(3),
                hit_rate: safe_hit_rate(clamp(market_hit_rate + 0.6, 45.0, 82.0)),
            }]),
        }]),
    })
}

fn value_tone(score: u8) -> String {
    if score >= 74 {
        "strong".to_string()
    } else if score >= 58 {
        "medium".to_string()
    } else {
        "risky".to_string()
    }
}

fn clamp_u8_i16(base: u8, delta: i16, min: u8, max: u8) -> u8 {
    let shifted = i16::from(base) + delta;
    shifted.clamp(i16::from(min), i16::from(max)) as u8
}

fn build_value_profile(
    home_team: &str,
    away_team: &str,
    probabilities: &Probabilities,
    top_recommendation: Option<&Recommendation>,
    coverage_score: u8,
    confidence_score: u8,
    light_scan: bool,
) -> ValueProfile {
    let top_market = top_recommendation
        .map(|item| item.market.clone())
        .unwrap_or_else(|| "1X2".to_string());
    let top_probability = top_recommendation
        .map(|item| item.probability.max(1))
        .unwrap_or_else(|| {
            probabilities
                .home_win
                .max(probabilities.draw)
                .max(probabilities.away_win)
                .max(1)
        });
    let model_odds = clamp(100.0 / top_probability as f64, 1.01, 12.0);
    let synthetic_market_odds = clamp(
        model_odds
            + (52.0 - coverage_score as f64) * 0.012
            + (68.0 - confidence_score as f64) * 0.009
            + if light_scan { 0.08 } else { -0.02 },
        1.05,
        12.0,
    );
    let edge_percent = ((synthetic_market_odds / model_odds) - 1.0) * 100.0;
    let value_score = clamp(
        50.0 + edge_percent * 2.4
            + (confidence_score as f64 - 56.0) * 0.32
            + (coverage_score as f64 - 55.0) * 0.22,
        26.0,
        96.0,
    )
    .round() as u8;
    let tone = value_tone(value_score);
    let direction = if edge_percent > 1.8 {
        "up"
    } else if edge_percent < -1.8 {
        "down"
    } else {
        "flat"
    };
    let market_focus = if top_market == "1X2" {
        if probabilities.home_win >= probabilities.away_win {
            format!("{home_team} tarafı")
        } else {
            format!("{away_team} tarafı")
        }
    } else {
        normalize_market_group_key(&top_market)
    };
    let module_summary = if value_score >= 74 {
        format!(
            "{} için model edge %+{:.1}. Fiyat-model uyumsuzluğu oynanabilir bölgede.",
            top_market, edge_percent
        )
    } else if value_score >= 58 {
        format!(
            "{} için model edge %+{:.1}. Değer var ama dağılımlı risk önerilir.",
            top_market, edge_percent
        )
    } else {
        format!(
            "{} için edge %+{:.1}. Fiyat avantajı zayıf; agresif girişten kaçınılmalı.",
            top_market, edge_percent
        )
    };
    let alert_title = if value_score >= 74 {
        "Value alarmı güçlü".to_string()
    } else if value_score >= 58 {
        "Value alarmı dengeli".to_string()
    } else {
        "Value alarmı zayıf".to_string()
    };
    let alert_detail = format!(
        "{} odaklı fiyat okuması: model oranı {:.2}, sentetik piyasa {:.2}, edge %+{:.1}.",
        market_focus, model_odds, synthetic_market_odds, edge_percent
    );

    ValueProfile {
        score: value_score,
        tone: tone.clone(),
        module_summary,
        alert_title,
        alert_detail: alert_detail.clone(),
        odds_movement: OddsMovement {
            label: "Value baskısı".to_string(),
            score: value_score,
            direction: direction.to_string(),
            detail: alert_detail,
            source: "Yerel model + sentetik piyasa".to_string(),
            market_depth: if value_score >= 74 {
                6
            } else if value_score >= 58 {
                4
            } else {
                2
            },
            odds_channels: if light_scan { 2 } else { 3 },
            live_odds: false,
        },
        market_insight: MarketInsight {
            market: "Value alarmı".to_string(),
            probability: value_score,
            angle: "Fiyat".to_string(),
            detail: format!("{top_market} • edge %+{:.1}", edge_percent),
            tone,
        },
    }
}

fn build_model_explain_cards(
    home_team: &str,
    away_team: &str,
    momentum_gap: f64,
    goal_diff_gap: f64,
    context_shift: f64,
    projected_goals: f64,
    top_recommendation: Option<&Recommendation>,
    calibration_outcome: Option<&CalibrationOutcome>,
    auto_calibration_used: bool,
    lineup_verification: Option<&LineupVerification>,
) -> Vec<ExplainCard> {
    let momentum_side = if momentum_gap > 0.0 {
        home_team
    } else if momentum_gap < 0.0 {
        away_team
    } else {
        "denge"
    };
    let context_side = if context_shift > 0.01 {
        home_team
    } else if context_shift < -0.01 {
        away_team
    } else {
        "denge"
    };
    let mut cards = vec![
        ExplainCard {
            title: "Form momentumu".to_string(),
            impact: if momentum_side == "denge" {
                "Nötr".to_string()
            } else {
                format!("{momentum_side} +")
            },
            detail: format!(
                "Ağırlıklı form farkı {:.2}; taraf eğimi {} yönüne kaydı.",
                momentum_gap.abs(),
                if momentum_side == "denge" {
                    "nötr"
                } else {
                    momentum_side
                }
            ),
            tone: if momentum_side == "denge" {
                "medium".to_string()
            } else {
                "strong".to_string()
            },
        },
        ExplainCard {
            title: "Gol tavanı".to_string(),
            impact: format!("{projected_goals:.2} gol"),
            detail: format!(
                "Gol farkı trendi {:.2}. Tempo hattı {} senaryosunu öne taşıyor.",
                goal_diff_gap,
                if projected_goals >= 2.8 {
                    "üst"
                } else {
                    "kontrollü"
                }
            ),
            tone: if projected_goals >= 2.8 {
                "strong".to_string()
            } else {
                "medium".to_string()
            },
        },
        ExplainCard {
            title: "Bağlam düzeltmesi".to_string(),
            impact: if context_side == "denge" {
                "Nötr".to_string()
            } else {
                format!("{context_side} +")
            },
            detail: "İç saha/deplasman, puan tablosu ve kadro sinyali tek katsayıda birleştirildi."
                .to_string(),
            tone: if context_side == "denge" {
                "medium".to_string()
            } else {
                "strong".to_string()
            },
        },
    ];
    if let Some(top) = top_recommendation {
        cards.push(ExplainCard {
            title: "Ana pazar seçimi".to_string(),
            impact: format!("{} %{}", top.market, top.probability),
            detail: top.reason.clone(),
            tone: if top.probability >= 70 {
                "strong".to_string()
            } else {
                "medium".to_string()
            },
        });
    }
    if let Some(outcome) = calibration_outcome {
        cards.push(ExplainCard {
            title: "Kalibrasyon etkisi".to_string(),
            impact: format!("±{:.0}", outcome.max_probability_shift),
            detail: outcome.summary.clone(),
            tone: if outcome.max_probability_shift >= 4.0 {
                "strong".to_string()
            } else {
                "medium".to_string()
            },
        });
    } else if auto_calibration_used {
        cards.push(ExplainCard {
            title: "Mini kalibrasyon".to_string(),
            impact: "Aktif".to_string(),
            detail: "Harici backtest yokken son form penceresi ile mikro ayar uygulandı."
                .to_string(),
            tone: "medium".to_string(),
        });
    }
    if let Some(verification) = lineup_verification {
        cards.push(ExplainCard {
            title: "Kadro doğrulama".to_string(),
            impact: format!("{} %{}", verification.consistency, verification.confidence),
            detail: verification.detail.clone(),
            tone: if verification.confidence >= 75 {
                "strong".to_string()
            } else if verification.confidence >= 60 {
                "medium".to_string()
            } else {
                "risky".to_string()
            },
        });
    }
    cards.truncate(6);
    cards
}

fn build_net_kpi_status(
    value: u8,
    target: u8,
    comparator: &str,
    sample_size: u16,
    min_sample: u16,
) -> String {
    if sample_size < min_sample {
        return "waiting".to_string();
    }
    let pass = if comparator == "max" {
        value <= target
    } else {
        value >= target
    };
    if pass {
        "hit".to_string()
    } else {
        "risk".to_string()
    }
}

fn build_net_kpis(
    confidence_score: u8,
    coverage_score: u8,
    top_pick_probability: u8,
    calibration_profile: Option<&CalibrationProfileRequest>,
    lineup_verification: Option<&LineupVerification>,
) -> Vec<NetKpi> {
    let sample_size = calibration_profile
        .and_then(|item| item.sample_size)
        .unwrap_or(0);
    let effective_sample = sample_size.max(8);
    let calibration_depth = clamp(sample_size as f64 * 1.6, 0.0, 100.0).round() as u8;
    let lineup_confidence = lineup_verification
        .map(|item| item.confidence)
        .unwrap_or(55);

    vec![
        NetKpi {
            key: "model_confidence".to_string(),
            label: "Model güveni".to_string(),
            value: confidence_score,
            target: ">=62".to_string(),
            status: build_net_kpi_status(confidence_score, 62, "min", effective_sample, 8),
            sample_size: effective_sample,
            detail: "Toplam güven skoru ana karar hattının kararlılığını ölçer.".to_string(),
        },
        NetKpi {
            key: "data_coverage".to_string(),
            label: "Veri kapsaması".to_string(),
            value: coverage_score,
            target: ">=70".to_string(),
            status: build_net_kpi_status(coverage_score, 70, "min", effective_sample, 8),
            sample_size: effective_sample,
            detail: "Form, H2H, saha ve kadro katmanlarının birlikte doluluk seviyesi.".to_string(),
        },
        NetKpi {
            key: "pick_strength".to_string(),
            label: "Ana öneri kuvveti".to_string(),
            value: top_pick_probability,
            target: ">=65".to_string(),
            status: build_net_kpi_status(top_pick_probability, 65, "min", effective_sample, 8),
            sample_size: effective_sample,
            detail: "İlk önerinin olasılığı; agresif değil ama seçilebilir eşik aranır."
                .to_string(),
        },
        NetKpi {
            key: "calibration_depth".to_string(),
            label: "Kalibrasyon derinliği".to_string(),
            value: calibration_depth,
            target: ">=55".to_string(),
            status: build_net_kpi_status(calibration_depth, 55, "min", sample_size, 16),
            sample_size,
            detail: if sample_size >= 16 {
                "Backtest örneklemi yeterli; olasılık ayarı kararlı bölgede.".to_string()
            } else {
                "Kalibrasyon örneklemi birikiyor; mini ayar düşük ağırlıkta tutuluyor.".to_string()
            },
        },
        NetKpi {
            key: "lineup_consistency".to_string(),
            label: "Kadro doğrulama".to_string(),
            value: lineup_confidence,
            target: ">=65".to_string(),
            status: build_net_kpi_status(lineup_confidence, 65, "min", effective_sample, 8),
            sample_size: effective_sample,
            detail: lineup_verification
                .map(|item| item.detail.clone())
                .unwrap_or_else(|| "Kadro sinyali tek kaynaktan alındı.".to_string()),
        },
    ]
}

fn build_http_client() -> Result<Client, String> {
    let mut headers = HeaderMap::new();
    headers.insert(
        USER_AGENT,
        HeaderValue::from_static(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        ),
    );
    headers.insert(
        ACCEPT,
        HeaderValue::from_static("text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"),
    );
    headers.insert(
        ACCEPT_LANGUAGE,
        HeaderValue::from_static("tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7"),
    );
    headers.insert(CACHE_CONTROL, HeaderValue::from_static("no-cache"));
    headers.insert(PRAGMA, HeaderValue::from_static("no-cache"));

    Client::builder()
        .default_headers(headers)
        .timeout(Duration::from_secs(18))
        .build()
        .map_err(|e| format!("HTTP istemcisi kurulamadı: {e}"))
}

fn fetch_json<T: DeserializeOwned>(client: &Client, url: &str) -> Result<T, String> {
    let body = client
        .get(url)
        .send()
        .and_then(|response| response.error_for_status())
        .map_err(|e| format!("İstatistik verisi çekilemedi: {e}"))?
        .text()
        .map_err(|e| format!("İstatistik verisi okunamadı: {e}"))?;

    serde_json::from_str::<T>(&body).map_err(|e| format!("İstatistik verisi çözülemedi: {e}"))
}

fn recent_matches_for_team_at_venue(
    matches: &[ParsedMatch],
    team: &str,
    home_venue: bool,
    limit: usize,
) -> Vec<ParsedMatch> {
    let mut filtered = matches
        .iter()
        .filter(|item| {
            if home_venue {
                team_name_matches(&item.home, team)
            } else {
                team_name_matches(&item.away, team)
            }
        })
        .cloned()
        .collect::<Vec<_>>();
    sort_matches_by_recent_date(&mut filtered);
    filtered.truncate(limit);
    filtered
}

fn football_data_token_from_request(data_request: Option<&DataSourceRequest>) -> Option<String> {
    data_request
        .and_then(|item| item.football_data_token.as_deref())
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(|value| value.to_string())
}

fn build_football_data_client(token: &str) -> Result<Client, String> {
    let mut headers = HeaderMap::new();
    headers.insert(
        USER_AGENT,
        HeaderValue::from_static(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        ),
    );
    headers.insert(ACCEPT, HeaderValue::from_static("application/json"));
    headers.insert(
        ACCEPT_LANGUAGE,
        HeaderValue::from_static("tr-TR,tr;q=0.9,en-US;q=0.8"),
    );
    headers.insert(
        HeaderName::from_static("x-auth-token"),
        HeaderValue::from_str(token)
            .map_err(|_| "football-data.org token başlığa eklenemedi.".to_string())?,
    );
    Client::builder()
        .default_headers(headers)
        .timeout(Duration::from_secs(16))
        .build()
        .map_err(|e| format!("football-data istemcisi kurulamadı: {e}"))
}

fn football_data_team_match_score(item: &FootballDataTeamSearchItem, target: &str) -> i32 {
    let mut score = 0i32;
    if team_name_matches(&item.name, target) {
        score += 6;
    }
    if normalize_team_name(&item.name) == normalize_team_name(target) {
        score += 4;
    }
    if let Some(short_name) = item.short_name.as_deref() {
        if team_name_matches(short_name, target) {
            score += 3;
        }
    }
    if let Some(tla) = item.tla.as_deref() {
        let short_code = normalize_team_name(tla);
        if !short_code.is_empty() && normalize_team_name(target).contains(&short_code) {
            score += 1;
        }
    }
    score
}

fn resolve_football_data_team(
    client: &Client,
    team_name: &str,
) -> Result<FootballDataTeamDetail, String> {
    let encoded = url::form_urlencoded::byte_serialize(team_name.as_bytes()).collect::<String>();
    let search_url = format!("https://api.football-data.org/v4/teams?name={encoded}");
    let search: FootballDataTeamSearchResponse = fetch_json(client, &search_url)?;
    let Some(best_match) = search.teams.into_iter().max_by(|left, right| {
        football_data_team_match_score(left, team_name)
            .cmp(&football_data_team_match_score(right, team_name))
    }) else {
        return Err(format!("football-data eşleşmesi bulunamadı: {team_name}"));
    };
    if football_data_team_match_score(&best_match, team_name) < 2 {
        return Err(format!(
            "football-data takım eşleşmesi zayıf kaldı: {team_name}"
        ));
    }
    fetch_json(
        client,
        &format!("https://api.football-data.org/v4/teams/{}", best_match.id),
    )
}

fn pick_shared_competition(
    home_team: &FootballDataTeamDetail,
    away_team: &FootballDataTeamDetail,
) -> Option<(String, String)> {
    let mut away_codes = HashMap::<String, String>::new();
    for item in &away_team.running_competitions {
        let Some(code) = item
            .code
            .as_deref()
            .map(str::trim)
            .filter(|value| !value.is_empty())
            .map(|value| value.to_ascii_uppercase())
        else {
            continue;
        };
        let name = item
            .name
            .as_deref()
            .map(str::trim)
            .filter(|value| !value.is_empty())
            .unwrap_or(code.as_str())
            .to_string();
        away_codes.insert(code, name);
    }
    for item in &home_team.running_competitions {
        let Some(code) = item
            .code
            .as_deref()
            .map(str::trim)
            .filter(|value| !value.is_empty())
            .map(|value| value.to_ascii_uppercase())
        else {
            continue;
        };
        if away_codes.contains_key(&code) {
            let name = item
                .name
                .as_deref()
                .map(str::trim)
                .filter(|value| !value.is_empty())
                .map(|value| value.to_string())
                .or_else(|| away_codes.get(&code).cloned())
                .unwrap_or(code.clone());
            return Some((code, name));
        }
    }
    None
}

fn build_standings_context(
    data_request: Option<&DataSourceRequest>,
    home_team: &str,
    away_team: &str,
) -> Option<StandingsContext> {
    let token = football_data_token_from_request(data_request)?;
    let client = build_football_data_client(&token).ok()?;
    let home_data = resolve_football_data_team(&client, home_team).ok()?;
    let away_data = resolve_football_data_team(&client, away_team).ok()?;
    let (competition_code, competition_name) = pick_shared_competition(&home_data, &away_data)?;
    let standings_url =
        format!("https://api.football-data.org/v4/competitions/{competition_code}/standings");
    let standings: FootballDataStandingsResponse = fetch_json(&client, &standings_url).ok()?;
    let table = standings
        .standings
        .iter()
        .max_by_key(|item| item.table.len())
        .map(|item| item.table.clone())?;
    if table.is_empty() {
        return None;
    }

    let mut all_rows = table
        .into_iter()
        .filter_map(|row| {
            let team_name = row
                .team
                .as_ref()?
                .name
                .as_deref()
                .map(str::trim)
                .filter(|value| !value.is_empty())?
                .to_string();
            let highlight = team_name_matches(&team_name, home_team)
                || team_name_matches(&team_name, away_team);
            Some(LeagueStandingRow {
                position: row.position.unwrap_or(0),
                team: team_name,
                played: row.played_games.unwrap_or(0),
                won: row.won.unwrap_or(0),
                draw: row.draw.unwrap_or(0),
                lost: row.lost.unwrap_or(0),
                goal_diff: row.goal_difference.unwrap_or(0),
                points: row.points.unwrap_or(0),
                form: clean_fragment(row.form.as_deref().unwrap_or("-")),
                highlight,
            })
        })
        .collect::<Vec<_>>();
    if all_rows.is_empty() {
        return None;
    }
    all_rows.sort_by(|left, right| left.position.cmp(&right.position));

    let home_row = all_rows
        .iter()
        .find(|item| team_name_matches(&item.team, home_team));
    let away_row = all_rows
        .iter()
        .find(|item| team_name_matches(&item.team, away_team));

    let (home_shift, confidence_delta, summary) = if let (Some(home), Some(away)) =
        (home_row, away_row)
    {
        let point_gap = home.points as i32 - away.points as i32;
        let rank_gap = away.position as i16 - home.position as i16;
        let goal_gap = home.goal_diff as i32 - away.goal_diff as i32;
        let side = if point_gap > 0 || rank_gap > 0 {
            home_team
        } else if point_gap < 0 || rank_gap < 0 {
            away_team
        } else {
            "denge"
        };
        let summary = if side == "denge" {
            format!(
                "{competition_name} tablosunda iki takım yakın: {} {} puan, {} {} puan.",
                home_team, home.points, away_team, away.points
            )
        } else {
            format!(
                "{competition_name} tablosunda {} tarafı önde: puan farkı {}, sıra farkı {}.",
                side,
                point_gap.abs(),
                rank_gap.abs()
            )
        };
        (
            clamp(
                point_gap as f64 * 0.0015 + rank_gap as f64 * 0.004 + goal_gap as f64 * 0.0007,
                -0.07,
                0.07,
            ),
            clamp(
                point_gap.abs() as f64 * 0.08 + rank_gap.abs() as f64 * 0.65,
                0.0,
                4.8,
            ),
            summary,
        )
    } else {
        (
            0.0,
            0.0,
            format!(
                "{competition_name} tablosu alındı ancak iki takım satırı net eşleşmedi; modelde etkisi nötr bırakıldı."
            ),
        )
    };

    let mut visible_rows = all_rows.iter().take(10).cloned().collect::<Vec<_>>();
    for row in all_rows.iter().filter(|item| item.highlight) {
        if !visible_rows
            .iter()
            .any(|item| team_name_matches(&item.team, &row.team))
        {
            visible_rows.push(row.clone());
        }
    }
    visible_rows.sort_by(|left, right| left.position.cmp(&right.position));

    Some(StandingsContext {
        rows: visible_rows,
        summary,
        home_shift,
        confidence_delta,
    })
}

fn calibration_sample_weight(sample_size: u16, full_sample: f64) -> f64 {
    if sample_size == 0 {
        return 0.0;
    }
    clamp(sample_size as f64 / full_sample, 0.24, 1.0)
}

fn normalize_market_group_key(raw: &str) -> String {
    let mut normalized = raw.trim().to_ascii_lowercase();
    normalized = normalized.replace('-', "_").replace(' ', "_");
    while normalized.contains("__") {
        normalized = normalized.replace("__", "_");
    }
    normalized = normalized.trim_matches('_').to_string();
    match normalized.as_str() {
        "doublechance" => "double_chance".to_string(),
        "hardside" => "hard_side".to_string(),
        "totalsover" => "totals_over".to_string(),
        "totalsunder" => "totals_under".to_string(),
        "bttsyes" => "btts_yes".to_string(),
        "bttsno" => "btts_no".to_string(),
        _ => normalized,
    }
}

fn market_group_from_recommendation(market: &str) -> String {
    let normalized = normalize_team_phrase(market);
    if normalized.starts_with("1x") || normalized.starts_with("x2") {
        return "double_chance".to_string();
    }
    if normalized == "1"
        || normalized == "2"
        || normalized.starts_with("1 ")
        || normalized.starts_with("2 ")
    {
        return "hard_side".to_string();
    }
    if normalized.contains("beraber") || normalized.contains("draw") {
        return "draw".to_string();
    }
    if normalized.contains("kg var") {
        return "btts_yes".to_string();
    }
    if normalized.contains("kg yok") {
        return "btts_no".to_string();
    }
    if normalized.contains("uzak dur") {
        return "avoid".to_string();
    }
    if normalized.contains("ust") {
        return "totals_over".to_string();
    }
    if normalized.contains("alt") {
        return "totals_under".to_string();
    }
    "other".to_string()
}

fn build_calibration_context(
    profile: Option<&CalibrationProfileRequest>,
) -> Option<CalibrationContext> {
    let profile = profile?;
    let sample_size = profile.sample_size.unwrap_or(0);
    if sample_size < 8 {
        return None;
    }
    let overall_top_hit_rate = profile
        .overall_top_hit_rate
        .map(|value| value.clamp(0, 100) as f64)
        .unwrap_or(50.0);

    let mut market_buckets = HashMap::<String, CalibrationBucket>::new();
    if let Some(market_profiles) = profile.market_profiles.as_ref() {
        for item in market_profiles {
            let market_key = normalize_market_group_key(&item.market_group);
            if market_key.is_empty() || item.sample_size < 2 {
                continue;
            }
            market_buckets.insert(
                market_key,
                CalibrationBucket {
                    sample_size: item.sample_size,
                    hit_rate: item.hit_rate.clamp(0, 100) as f64,
                },
            );
        }
    }

    let mut league_profiles = Vec::<LeagueCalibrationProfile>::new();
    if let Some(league_items) = profile.league_profiles.as_ref() {
        for league in league_items {
            let key = normalize_team_phrase(&league.league);
            if key.is_empty() || league.sample_size < 2 {
                continue;
            }
            let mut market_map = HashMap::<String, CalibrationBucket>::new();
            if let Some(market_profiles) = league.market_profiles.as_ref() {
                for item in market_profiles {
                    let market_key = normalize_market_group_key(&item.market_group);
                    if market_key.is_empty() || item.sample_size < 2 {
                        continue;
                    }
                    market_map.insert(
                        market_key,
                        CalibrationBucket {
                            sample_size: item.sample_size,
                            hit_rate: item.hit_rate.clamp(0, 100) as f64,
                        },
                    );
                }
            }
            league_profiles.push(LeagueCalibrationProfile {
                key,
                label: clean_fragment(&league.league),
                top_bucket: CalibrationBucket {
                    sample_size: league.sample_size,
                    hit_rate: league.top_hit_rate.clamp(0, 100) as f64,
                },
                market_buckets: market_map,
            });
        }
    }

    if market_buckets.is_empty() && league_profiles.is_empty() {
        return None;
    }

    Some(CalibrationContext {
        sample_size,
        overall_top_hit_rate,
        market_buckets,
        league_profiles,
    })
}

fn find_league_calibration<'a>(
    context: &'a CalibrationContext,
    league_label: &str,
) -> Option<&'a LeagueCalibrationProfile> {
    let league_key = normalize_team_phrase(league_label);
    if league_key.is_empty() {
        return None;
    }
    context
        .league_profiles
        .iter()
        .find(|item| item.key == league_key)
        .or_else(|| {
            context.league_profiles.iter().find(|item| {
                contains_whole_phrase(&league_key, &item.key)
                    || contains_whole_phrase(&item.key, &league_key)
            })
        })
}

fn calibrate_recommendation_probability(
    base_probability: u8,
    market_group: &str,
    context: &CalibrationContext,
    league_profile: Option<&LeagueCalibrationProfile>,
) -> (u8, f64) {
    let overall = context.overall_top_hit_rate;
    let mut adjustment = 0.0;

    if let Some(bucket) = context.market_buckets.get(market_group) {
        adjustment += (bucket.hit_rate - overall)
            * 0.24
            * calibration_sample_weight(bucket.sample_size, 18.0);
    }

    if let Some(league) = league_profile {
        adjustment += (league.top_bucket.hit_rate - overall)
            * 0.17
            * calibration_sample_weight(league.top_bucket.sample_size, 18.0);
        if let Some(bucket) = league.market_buckets.get(market_group) {
            adjustment += (bucket.hit_rate - overall)
                * 0.23
                * calibration_sample_weight(bucket.sample_size, 12.0);
        }
    }

    adjustment += (overall - 56.0) * 0.05 * calibration_sample_weight(context.sample_size, 40.0);
    if market_group == "avoid" {
        adjustment *= 0.60;
    }

    let adjustment = clamp(adjustment, -9.0, 9.0);
    let calibrated = clamp(base_probability as f64 + adjustment, 1.0, 99.0).round() as u8;
    (calibrated, adjustment)
}

fn calibrate_confidence_score(
    base_confidence: u8,
    top_market_group: &str,
    context: &CalibrationContext,
    league_profile: Option<&LeagueCalibrationProfile>,
) -> (u8, f64) {
    let overall = context.overall_top_hit_rate;
    let mut adjustment =
        (overall - 56.0) * 0.07 * calibration_sample_weight(context.sample_size, 45.0);

    if let Some(bucket) = context.market_buckets.get(top_market_group) {
        adjustment += (bucket.hit_rate - overall)
            * 0.10
            * calibration_sample_weight(bucket.sample_size, 18.0);
    }
    if let Some(league) = league_profile {
        adjustment += (league.top_bucket.hit_rate - overall)
            * 0.08
            * calibration_sample_weight(league.top_bucket.sample_size, 18.0);
        if let Some(bucket) = league.market_buckets.get(top_market_group) {
            adjustment += (bucket.hit_rate - overall)
                * 0.11
                * calibration_sample_weight(bucket.sample_size, 12.0);
        }
    }

    let adjustment = clamp(adjustment, -6.0, 6.0);
    let calibrated = clamp(base_confidence as f64 + adjustment, 42.0, 95.0).round() as u8;
    (calibrated, adjustment)
}

fn apply_calibration_profile(
    recommendations: &mut Vec<Recommendation>,
    confidence_score: &mut u8,
    league_label: &str,
    profile: Option<&CalibrationProfileRequest>,
) -> Option<CalibrationOutcome> {
    if recommendations.is_empty() {
        return None;
    }
    let context = build_calibration_context(profile)?;
    let league_profile = find_league_calibration(&context, league_label);

    let mut max_probability_shift: f64 = 0.0;
    for recommendation in recommendations.iter_mut() {
        let market_group = market_group_from_recommendation(&recommendation.market);
        let (calibrated_probability, probability_shift) = calibrate_recommendation_probability(
            recommendation.probability,
            &market_group,
            &context,
            league_profile,
        );
        recommendation.probability = calibrated_probability;
        max_probability_shift = max_probability_shift.max(probability_shift.abs());
    }

    recommendations.sort_by(|left, right| right.probability.cmp(&left.probability));

    let top_market_group = recommendations
        .first()
        .map(|item| market_group_from_recommendation(&item.market))
        .unwrap_or_else(|| "other".to_string());
    let (calibrated_confidence, confidence_delta) = calibrate_confidence_score(
        *confidence_score,
        &top_market_group,
        &context,
        league_profile,
    );
    *confidence_score = calibrated_confidence;

    let league_scope = league_profile
        .map(|item| item.label.clone())
        .unwrap_or_else(|| "genel lig".to_string());

    Some(CalibrationOutcome {
        max_probability_shift,
        confidence_delta,
        summary: format!(
            "Backtest kalibrasyonu aktif: {} sonuç (%{:.0} genel isabet) ile {} bağlamında olasılıklar en fazla ±{:.0} puan ayarlandı.",
            context.sample_size,
            context.overall_top_hit_rate,
            league_scope,
            max_probability_shift
        ),
    })
}

fn api_football_key_from_request(data_request: Option<&DataSourceRequest>) -> Option<String> {
    data_request
        .and_then(|item| item.api_football_key.as_deref())
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(|value| value.to_string())
}

fn api_football_base_url_from_request(data_request: Option<&DataSourceRequest>) -> String {
    let raw = data_request
        .and_then(|item| item.api_football_base_url.as_deref())
        .map(str::trim)
        .unwrap_or("");
    if raw.is_empty() {
        return "https://v3.football.api-sports.io".to_string();
    }
    raw.trim_end_matches('/').to_string()
}

fn build_api_football_client(api_key: &str, base_url: &str) -> Result<Client, String> {
    let mut headers = HeaderMap::new();
    headers.insert(
        USER_AGENT,
        HeaderValue::from_static(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        ),
    );
    headers.insert(ACCEPT, HeaderValue::from_static("application/json"));
    headers.insert(
        ACCEPT_LANGUAGE,
        HeaderValue::from_static("tr-TR,tr;q=0.9,en-US;q=0.8"),
    );
    headers.insert(
        HeaderName::from_static("x-apisports-key"),
        HeaderValue::from_str(api_key)
            .map_err(|_| "API-Football key başlığa eklenemedi.".to_string())?,
    );
    if let Ok(parsed) = Url::parse(base_url) {
        if let Some(host) = parsed.host_str() {
            if host.contains("rapidapi.com") {
                headers.insert(
                    HeaderName::from_static("x-rapidapi-key"),
                    HeaderValue::from_str(api_key)
                        .map_err(|_| "RapidAPI key başlığa eklenemedi.".to_string())?,
                );
                headers.insert(
                    HeaderName::from_static("x-rapidapi-host"),
                    HeaderValue::from_str(host)
                        .map_err(|_| "RapidAPI host başlığa eklenemedi.".to_string())?,
                );
            }
        }
    }

    Client::builder()
        .default_headers(headers)
        .timeout(Duration::from_secs(16))
        .build()
        .map_err(|e| format!("API-Football istemcisi kurulamadı: {e}"))
}

fn api_football_team_match_score(item: &ApiFootballTeamRef, target: &str) -> i32 {
    let Some(name) = item.name.as_deref() else {
        return 0;
    };
    let mut score = 0i32;
    if team_name_matches(name, target) {
        score += 6;
    }
    if normalize_team_name(name) == normalize_team_name(target) {
        score += 4;
    }
    score
}

fn resolve_api_football_team(
    client: &Client,
    base_url: &str,
    team_name: &str,
) -> Option<ApiFootballTeamRef> {
    let encoded = url::form_urlencoded::byte_serialize(team_name.as_bytes()).collect::<String>();
    let search_url = format!("{base_url}/teams?search={encoded}");
    let payload =
        fetch_json::<ApiFootballEnvelope<ApiFootballTeamSearchItem>>(client, &search_url).ok()?;
    let best_match = payload
        .response
        .into_iter()
        .filter_map(|item| item.team)
        .max_by(|left, right| {
            api_football_team_match_score(left, team_name)
                .cmp(&api_football_team_match_score(right, team_name))
        })?;
    if api_football_team_match_score(&best_match, team_name) < 2 {
        return None;
    }
    best_match.id?;
    Some(best_match)
}

fn infer_season_candidates(match_date_hint: &str) -> Vec<u16> {
    let fallback_date = today_iso_date();
    let source = if clean_fragment(match_date_hint).is_empty() {
        fallback_date.as_str()
    } else {
        match_date_hint
    };
    let parsed = parse_date_key(source)
        .or_else(|| parse_date_key(&fallback_date))
        .unwrap_or((2025, 8, 1));
    let mut candidates = Vec::<u16>::new();
    let season_start = if parsed.1 <= 6 {
        parsed.0.saturating_sub(1)
    } else {
        parsed.0
    };
    for value in [season_start, parsed.0] {
        if !(2000..=2100).contains(&value) {
            continue;
        }
        let season = value as u16;
        if !candidates.contains(&season) {
            candidates.push(season);
        }
    }
    if candidates.is_empty() {
        candidates.push(2025);
    }
    candidates
}

fn fetch_api_football_team_injuries(
    client: &Client,
    base_url: &str,
    team_id: u64,
    season_candidates: &[u16],
) -> Option<Vec<ApiFootballInjuryItem>> {
    let mut latest_success = None;
    for season in season_candidates {
        let url = format!("{base_url}/injuries?team={team_id}&season={season}");
        if let Ok(payload) = fetch_json::<ApiFootballEnvelope<ApiFootballInjuryItem>>(client, &url)
        {
            if !payload.response.is_empty() {
                return Some(payload.response);
            }
            latest_success = Some(payload.response);
        }
    }
    let fallback_url = format!("{base_url}/injuries?team={team_id}");
    if let Ok(payload) =
        fetch_json::<ApiFootballEnvelope<ApiFootballInjuryItem>>(client, &fallback_url)
    {
        return Some(payload.response);
    }
    latest_success
}

fn count_api_football_absences(items: &[ApiFootballInjuryItem]) -> (usize, usize, usize) {
    let mut unique_players = HashSet::<String>::new();
    let mut total = 0usize;
    let mut suspended = 0usize;
    let mut injured = 0usize;

    for (index, item) in items.iter().enumerate() {
        let player_id = item.player.as_ref().and_then(|player| player.id);
        let player_name = item
            .player
            .as_ref()
            .and_then(|player| player.name.as_deref())
            .unwrap_or("");
        let dedupe_key = if let Some(player_id) = player_id {
            format!("id:{player_id}")
        } else {
            let normalized_name = normalize_team_phrase(player_name);
            if normalized_name.is_empty() {
                format!("row:{index}")
            } else {
                format!("name:{normalized_name}")
            }
        };
        if !unique_players.insert(dedupe_key) {
            continue;
        }

        total += 1;
        let descriptor = item
            .item_type
            .as_deref()
            .or_else(|| {
                item.player
                    .as_ref()
                    .and_then(|player| player.item_type.as_deref())
            })
            .or_else(|| item.reason.as_deref())
            .or_else(|| {
                item.player
                    .as_ref()
                    .and_then(|player| player.reason.as_deref())
            })
            .map(normalize_team_phrase)
            .unwrap_or_else(|| "injury".to_string());

        if descriptor.contains("suspend")
            || descriptor.contains("ceza")
            || descriptor.contains("ban")
            || descriptor.contains("card")
        {
            suspended += 1;
        } else {
            injured += 1;
        }
    }

    (total, suspended, injured)
}

fn fetch_api_football_absence_signal(
    data_request: Option<&DataSourceRequest>,
    home_team: &str,
    away_team: &str,
    match_date_hint: &str,
) -> Option<AbsenceSignal> {
    let api_key = api_football_key_from_request(data_request)?;
    let base_url = api_football_base_url_from_request(data_request);
    let client = build_api_football_client(&api_key, &base_url).ok()?;
    let home_team_ref = resolve_api_football_team(&client, &base_url, home_team)?;
    let away_team_ref = resolve_api_football_team(&client, &base_url, away_team)?;
    let home_team_id = home_team_ref.id?;
    let away_team_id = away_team_ref.id?;
    let season_candidates = infer_season_candidates(match_date_hint);
    let home_items =
        fetch_api_football_team_injuries(&client, &base_url, home_team_id, &season_candidates)?;
    let away_items =
        fetch_api_football_team_injuries(&client, &base_url, away_team_id, &season_candidates)?;

    let (home_total, home_suspended, _) = count_api_football_absences(&home_items);
    let (away_total, away_suspended, _) = count_api_football_absences(&away_items);
    if home_total == 0 && away_total == 0 {
        return None;
    }

    let diff = away_total as i32 - home_total as i32;
    let suspension_diff = away_suspended as i32 - home_suspended as i32;
    let weighted_diff = diff as f64 + suspension_diff as f64 * 0.65;
    let confidence_delta = if diff.abs() >= 3 || suspension_diff.abs() >= 2 {
        2.6
    } else if diff.abs() >= 1 {
        1.2
    } else {
        -0.8
    };
    let summary = if diff > 0 {
        Some(format!(
            "API-Football sakat/cezalı verisi: {} {} eksik ({} cezalı), {} {} eksik ({} cezalı). {} tarafı kadroda daha temiz görünüyor.",
            home_team,
            home_total,
            home_suspended,
            away_team,
            away_total,
            away_suspended,
            home_team
        ))
    } else if diff < 0 {
        Some(format!(
            "API-Football sakat/cezalı verisi: {} {} eksik ({} cezalı), {} {} eksik ({} cezalı). {} tarafı kadroda daha temiz görünüyor.",
            home_team,
            home_total,
            home_suspended,
            away_team,
            away_total,
            away_suspended,
            away_team
        ))
    } else {
        Some(format!(
            "API-Football sakat/cezalı verisi dengede: {} {} eksik ({} cezalı), {} {} eksik ({} cezalı).",
            home_team,
            home_total,
            home_suspended,
            away_team,
            away_total,
            away_suspended
        ))
    };

    Some(AbsenceSignal {
        home_mentions: home_total,
        away_mentions: away_total,
        home_shift: clamp(weighted_diff * 0.0105, -0.085, 0.085),
        home_goal_shift: clamp(weighted_diff * 0.045, -0.24, 0.24),
        away_goal_shift: clamp(-(weighted_diff) * 0.045, -0.24, 0.24),
        confidence_delta,
        summary,
    })
}

fn merge_absence_sources(
    api_signal: &AbsenceSignal,
    text_signal: &AbsenceSignal,
    home_team: &str,
    away_team: &str,
) -> AbsenceSignal {
    let mention_gap = (api_signal.home_mentions as i32 - text_signal.home_mentions as i32).abs()
        + (api_signal.away_mentions as i32 - text_signal.away_mentions as i32).abs();
    let consistency_delta = if mention_gap <= 2 {
        1.4
    } else if mention_gap <= 5 {
        0.2
    } else {
        -1.8
    };
    let source_summary = if mention_gap <= 2 {
        "API-Football ve sayfa metni kadro yönünde uyumlu."
    } else if mention_gap <= 5 {
        "Kadro kaynakları kısmi uyumlu; model temkinli ağırlık kullandı."
    } else {
        "Kadro kaynakları arasında ayrışma yüksek; etki katsayısı düşürüldü."
    };
    let home_mentions = api_signal.home_mentions.max(text_signal.home_mentions);
    let away_mentions = api_signal.away_mentions.max(text_signal.away_mentions);
    let base_summary = api_signal
        .summary
        .as_ref()
        .or(text_signal.summary.as_ref())
        .cloned()
        .unwrap_or_else(|| {
            format!(
                "{} ve {} için kadro sinyalleri birleştirildi.",
                home_team, away_team
            )
        });

    AbsenceSignal {
        home_mentions,
        away_mentions,
        home_shift: clamp(
            api_signal.home_shift * 0.72 + text_signal.home_shift * 0.28,
            -0.09,
            0.09,
        ),
        home_goal_shift: clamp(
            api_signal.home_goal_shift * 0.70 + text_signal.home_goal_shift * 0.30,
            -0.26,
            0.26,
        ),
        away_goal_shift: clamp(
            api_signal.away_goal_shift * 0.70 + text_signal.away_goal_shift * 0.30,
            -0.26,
            0.26,
        ),
        confidence_delta: clamp(
            api_signal.confidence_delta * 0.75
                + text_signal.confidence_delta * 0.25
                + consistency_delta,
            -4.0,
            4.8,
        ),
        summary: Some(format!("{base_summary} {source_summary}")),
    }
}

fn build_lineup_verification(
    api_signal: Option<&AbsenceSignal>,
    text_signal: Option<&AbsenceSignal>,
) -> Option<LineupVerification> {
    match (api_signal, text_signal) {
        (Some(api), Some(text)) => {
            let mention_gap = (api.home_mentions as i32 - text.home_mentions as i32).abs()
                + (api.away_mentions as i32 - text.away_mentions as i32).abs();
            let (consistency, confidence, detail) = if mention_gap <= 2 {
                (
                    "high",
                    88,
                    "Kadro sinyali iki kaynakta da aynı tarafı destekliyor.",
                )
            } else if mention_gap <= 5 {
                (
                    "medium",
                    71,
                    "Kadro sinyali kısmi uyumlu; model etkisi orta düzeyde tutuldu.",
                )
            } else {
                (
                    "low",
                    52,
                    "Kadro kaynakları ayrışıyor; yanlış pozitif riskine karşı etkisi düşürüldü.",
                )
            };
            Some(LineupVerification {
                primary_source: "API-Football".to_string(),
                secondary_source: "Sayfa metni".to_string(),
                consistency: consistency.to_string(),
                confidence,
                detail: detail.to_string(),
            })
        }
        (Some(_), None) => Some(LineupVerification {
            primary_source: "API-Football".to_string(),
            secondary_source: "Sayfa metni".to_string(),
            consistency: "single_source".to_string(),
            confidence: 64,
            detail: "Kadro sinyali tek kaynaktan alındı, ikinci kaynakta eşleşen ifade bulunamadı."
                .to_string(),
        }),
        (None, Some(_)) => Some(LineupVerification {
            primary_source: "Sayfa metni".to_string(),
            secondary_source: "API-Football".to_string(),
            consistency: "single_source".to_string(),
            confidence: 56,
            detail: "Kadro sinyali yalnızca sayfa metninden üretildi; API doğrulaması alınamadı."
                .to_string(),
        }),
        (None, None) => None,
    }
}

fn resolve_absence_signal(
    data_request: Option<&DataSourceRequest>,
    page_text: Option<&str>,
    home_team: &str,
    away_team: &str,
    match_date_hint: &str,
) -> (Option<AbsenceSignal>, Option<LineupVerification>) {
    let api_signal =
        fetch_api_football_absence_signal(data_request, home_team, away_team, match_date_hint);
    let text_signal = detect_absence_signal(page_text, home_team, away_team);
    let lineup_verification = build_lineup_verification(api_signal.as_ref(), text_signal.as_ref());
    let merged = match (api_signal, text_signal) {
        (Some(api), Some(text)) => Some(merge_absence_sources(&api, &text, home_team, away_team)),
        (Some(api), None) => Some(api),
        (None, Some(text)) => Some(text),
        (None, None) => None,
    };
    (merged, lineup_verification)
}

fn detect_absence_signal(
    page_text: Option<&str>,
    home_team: &str,
    away_team: &str,
) -> Option<AbsenceSignal> {
    let page_text = page_text?;
    let absence_keywords = [
        "sakat",
        "cezali",
        "cezalı",
        "injur",
        "suspend",
        "eksik",
        "kadro disi",
        "kadro dışı",
        "out",
    ];

    let mut home_mentions = 0usize;
    let mut away_mentions = 0usize;
    for raw_line in page_text.lines().take(2500) {
        let normalized = normalize_team_phrase(raw_line);
        if normalized.len() < 8 {
            continue;
        }
        if !absence_keywords
            .iter()
            .any(|keyword| normalized.contains(keyword))
        {
            continue;
        }
        let home_hit = team_name_matches(raw_line, home_team);
        let away_hit = team_name_matches(raw_line, away_team);
        if home_hit && away_hit {
            continue;
        }
        if home_hit {
            home_mentions += 1;
        }
        if away_hit {
            away_mentions += 1;
        }
        if home_mentions + away_mentions >= 10 {
            break;
        }
    }

    if home_mentions == 0 && away_mentions == 0 {
        return None;
    }
    let diff = away_mentions as i32 - home_mentions as i32;
    let summary = if diff > 0 {
        Some(format!(
            "Sakat/cezalı sinyalinde {} tarafı daha temiz görünüyor; {} üzerinde göreli kadro baskısı var.",
            home_team, away_team
        ))
    } else if diff < 0 {
        Some(format!(
            "Sakat/cezalı sinyalinde {} tarafı daha temiz görünüyor; {} üzerinde göreli kadro baskısı var.",
            away_team, home_team
        ))
    } else {
        Some(
            "Sakat/cezalı sinyali iki tarafa da yayılmış görünüyor; belirsizlik nedeniyle güven puanı hafif aşağı çekildi."
                .to_string(),
        )
    };
    Some(AbsenceSignal {
        home_mentions,
        away_mentions,
        home_shift: clamp(diff as f64 * 0.012, -0.06, 0.06),
        home_goal_shift: clamp(diff as f64 * 0.05, -0.20, 0.20),
        away_goal_shift: clamp(-(diff as f64) * 0.05, -0.20, 0.20),
        confidence_delta: if home_mentions + away_mentions >= 4 {
            -2.8
        } else {
            -1.6
        },
        summary,
    })
}

fn apply_ai_layer(response: &mut AnalysisResponse, ai_request: Option<&AiRequest>) {
    let Some(ai_request) = ai_request else {
        return;
    };

    if !ai_request.enabled {
        response.ai_status_message = "Harici AI katmanı kapalı.".to_string();
        return;
    }

    let model = ai_request
        .model
        .as_deref()
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .unwrap_or("gpt-5.2")
        .to_string();
    response.ai_model_label = model.clone();

    let api_key = ai_request
        .api_key
        .as_deref()
        .map(str::trim)
        .unwrap_or_default();

    if api_key.is_empty() {
        response.ai_status_message = "AI katmanı için API anahtarı girilmedi.".to_string();
        response.ai_summary_cards = vec![AiSummaryCard {
            title: "OpenAI bağlantısı bekleniyor".to_string(),
            detail: "Ayarlar bölümüne API anahtarını eklediğinde ikinci AI katmanı devreye girer."
                .to_string(),
        }];
        return;
    }

    match request_openai_layer(response, api_key, &model) {
        Ok(ai_payload) => {
            response.ai_layer_used = true;
            response.ai_status_message = ai_payload.status_message;
            response.ai_summary_cards = ai_payload.cards;
        }
        Err(_) => {
            response.ai_layer_used = false;
            response.ai_status_message =
                "OpenAI katmanı şu an kullanılamadı. Analitik motor çıktısı gösteriliyor."
                    .to_string();
            response.ai_summary_cards = vec![AiSummaryCard {
                title: "AI katmanı devreye alınamadı".to_string(),
                detail: "Bağlantı, model veya anahtar doğrulanamadığı için yalnızca yerel analiz gösteriliyor.".to_string(),
            }];
        }
    }
}

fn request_openai_layer(
    response: &AnalysisResponse,
    api_key: &str,
    model: &str,
) -> Result<OpenAiLayerPayload, String> {
    let mut headers = HeaderMap::new();
    headers.insert(
        AUTHORIZATION,
        HeaderValue::from_str(&format!("Bearer {api_key}"))
            .map_err(|_| "AI anahtarı başlığa eklenemedi.".to_string())?,
    );
    headers.insert(ACCEPT, HeaderValue::from_static("application/json"));
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));
    headers.insert(
        USER_AGENT,
        HeaderValue::from_static("MERTC-Bahis-Analizi/1.0"),
    );

    let client = Client::builder()
        .default_headers(headers)
        .timeout(Duration::from_secs(35))
        .build()
        .map_err(|e| format!("AI istemcisi kurulamadı: {e}"))?;

    let recommendation_text = response
        .recommendations
        .iter()
        .map(|item| format!("- {}: %{} | {}", item.market, item.probability, item.reason))
        .collect::<Vec<_>>()
        .join("\n");

    let prompt = format!(
        "Sen MERTC Bahis Analizi için çalışan ikinci AI yorum katmanısın. Aşağıdaki analitik motor çıktısını kısa, anlaşılır ve doğal Türkçe ile yeniden yorumla.\n\nKurallar:\n- Yalnızca Türkçe yaz.\n- Türkçe karakterleri doğru kullan.\n- Bahis garantisi verme.\n- Karmaşık ve yapay dil kullanma.\n- Kart başlıkları kısa olsun.\n- Her kart detayı en fazla 2 cümle olsun.\n\nDöndürmen gereken kartlar:\n1. AI Sonuç Okuması\n2. AI Pazar Açısı\n3. AI Kritik Risk\n\nVeri:\nMaç: {} vs {}\nLig: {}\nTarih: {}\nKaynak: {}\nGüven skoru: %{}\nOlasılıklar: 1=%{}, X=%{}, 2=%{}, KG Var=%{}, KG Yok=%{}\nPazarlar: 2.5 Üst=%{}, 3.5 Üst=%{}, Gol beklentisi={}\nAnalist kararı: {}\nTaktik özeti: {}\nRisk özeti: {}\nForm özeti: {}\nH2H özeti: {}\nÖneriler:\n{}\n",
        response.match_info.home_team,
        response.match_info.away_team,
        response.match_info.league,
        response.match_info.match_date,
        response.source_label,
        response.confidence_score,
        response.probabilities.home_win,
        response.probabilities.draw,
        response.probabilities.away_win,
        response.probabilities.btts_yes,
        response.probabilities.btts_no,
        response.markets.over25,
        response.markets.over35,
        response.markets.projected_goals,
        response.analyst_verdict,
        response.tactical_summary,
        response.risk_summary,
        response.form_summary,
        response.h2h_summary,
        recommendation_text,
    );

    let body = serde_json::json!({
        "model": model,
        "store": false,
        "reasoning": {
            "effort": "high"
        },
        "input": prompt,
        "text": {
            "format": {
                "type": "json_schema",
                "name": "mertc_ai_layer",
                "strict": true,
                "schema": {
                    "type": "object",
                    "additionalProperties": false,
                    "properties": {
                        "status_message": { "type": "string" },
                        "cards": {
                            "type": "array",
                            "minItems": 3,
                            "maxItems": 3,
                            "items": {
                                "type": "object",
                                "additionalProperties": false,
                                "properties": {
                                    "title": { "type": "string" },
                                    "detail": { "type": "string" }
                                },
                                "required": ["title", "detail"]
                            }
                        }
                    },
                    "required": ["status_message", "cards"]
                }
            }
        }
    });

    let api_response = client
        .post("https://api.openai.com/v1/responses")
        .json(&body)
        .send()
        .and_then(|response| response.error_for_status())
        .map_err(|e| format!("OpenAI yanıtı alınamadı: {e}"))?
        .json::<OpenAiApiResponse>()
        .map_err(|e| format!("OpenAI cevabı çözülemedi: {e}"))?;

    let output_text = api_response
        .output_text
        .ok_or_else(|| "OpenAI boş yanıt döndürdü.".to_string())?;

    serde_json::from_str::<OpenAiLayerPayload>(&output_text)
        .map_err(|e| format!("AI kartları çözülemedi: {e}"))
}

fn try_fetch_iddaa_data(url: &str) -> Result<Option<PrefetchedMatchData>, String> {
    let parsed = match Url::parse(url) {
        Ok(value) => value,
        Err(_) => return Ok(None),
    };

    let Some(domain) = parsed.domain() else {
        return Ok(None);
    };
    if !domain.ends_with("iddaa.com") {
        return Ok(None);
    }

    let segments = parsed
        .path_segments()
        .map(|parts| parts.filter(|part| !part.is_empty()).collect::<Vec<_>>())
        .unwrap_or_default();
    let client = build_http_client()?;
    let mut event_id = None::<String>;
    let mut sport_id = None::<u32>;

    if let Some(mac_index) = segments
        .iter()
        .position(|part| is_iddaa_match_detail_segment(part))
    {
        let sport_name = segments
            .get(mac_index.saturating_sub(1))
            .copied()
            .unwrap_or_default();
        sport_id = iddaa_sport_id(sport_name);
        event_id = segments.get(mac_index + 2).map(|value| value.to_string());
    }

    if event_id.is_none() {
        if let Some(event_index) = segments.iter().position(|part| *part == "event") {
            let inferred_event_id = segments.get(event_index + 1).copied().unwrap_or_default();
            if !inferred_event_id.trim().is_empty()
                && inferred_event_id.chars().all(|ch| ch.is_ascii_digit())
            {
                event_id = Some(inferred_event_id.to_string());
                sport_id = fetch_iddaa_sport_id_for_event(&client, inferred_event_id)
                    .ok()
                    .flatten();
            }
        }
    }

    let Some(event_id) = event_id else {
        return Ok(None);
    };
    let Some(sport_id) = sport_id else {
        return Ok(None);
    };
    let last_matches: ApiEnvelope<IddaaLastMatchesData> = fetch_json(
        &client,
        &format!("https://statisticsv2.iddaa.com/statistics/lastmatches/{sport_id}/{event_id}/10"),
    )?;

    if !last_matches.is_success {
        return Ok(None);
    }

    let Some(last_matches_data) = last_matches.data else {
        return Ok(None);
    };

    let mut home_recent = last_matches_data
        .home_over_all
        .iter()
        .cloned()
        .filter_map(iddaa_item_to_parsed_match)
        .collect::<Vec<_>>();
    let mut away_recent = last_matches_data
        .away_over_all
        .iter()
        .cloned()
        .filter_map(iddaa_item_to_parsed_match)
        .collect::<Vec<_>>();

    if home_recent.len() < 2 || away_recent.len() < 2 {
        return Ok(None);
    }

    let head_to_head = fetch_json::<ApiEnvelope<IddaaHeadToHeadData>>(
        &client,
        &format!("https://statisticsv2.iddaa.com/statistics/headtohead/{sport_id}/{event_id}/10"),
    )
    .ok();

    let mut h2h_matches = head_to_head
        .and_then(|payload| payload.data)
        .map(|payload| {
            payload
                .overall
                .into_iter()
                .filter_map(iddaa_item_to_parsed_match)
                .collect::<Vec<_>>()
        })
        .unwrap_or_default();

    sort_matches_by_recent_date(&mut home_recent);
    sort_matches_by_recent_date(&mut away_recent);
    sort_matches_by_recent_date(&mut h2h_matches);
    home_recent.truncate(5);
    away_recent.truncate(5);
    h2h_matches.truncate(5);

    let home_team = last_matches_data.home_team.name.trim().to_string();
    let away_team = last_matches_data.away_team.name.trim().to_string();

    let page = fetch_page(url).ok();
    let page_text = page.as_ref().map(|payload| payload.text.clone());
    let source_label = page
        .as_ref()
        .map(|payload| format!("iddaa.com • statistics API | {}", payload.title))
        .unwrap_or_else(|| "iddaa.com • statistics API".to_string());
    let league = page
        .as_ref()
        .map(|payload| payload.title.clone())
        .filter(|value| !value.trim().is_empty())
        .unwrap_or_else(|| format!("{} vs {}", home_team, away_team));
    let location_type = "iddaa istatistik servisi".to_string();

    Ok(Some(PrefetchedMatchData {
        source_label,
        league,
        match_date: today_iso_date(),
        location_type,
        page_text,
        home_team,
        away_team,
        home_recent,
        away_recent,
        h2h_matches,
    }))
}

fn is_iddaa_match_detail_segment(segment: &str) -> bool {
    let normalized = normalize_team_phrase(segment);
    normalized == "mac-detay" || normalized == "mac detay"
}

fn fetch_iddaa_sport_id_for_event(client: &Client, event_id: &str) -> Result<Option<u32>, String> {
    let payload: IddaaSportsbookEventDetailResponse = fetch_json(
        client,
        &format!("https://sportsbookv2.iddaa.com/sportsbook/event/{event_id}"),
    )?;
    if !payload.is_success {
        return Ok(None);
    }
    Ok(payload.data.and_then(|event| event.sport_id))
}

fn iddaa_sport_id(sport_name: &str) -> Option<u32> {
    match normalize_team_phrase(sport_name).as_str() {
        "futbol" => Some(1),
        "basketbol" => Some(2),
        "tenis" => Some(5),
        _ => None,
    }
}

fn iddaa_item_to_parsed_match(item: IddaaMatchItem) -> Option<ParsedMatch> {
    let home_goals = item
        .home_team_score
        .regular
        .or(item.home_team_score.current)?;
    let away_goals = item
        .away_team_score
        .regular
        .or(item.away_team_score.current)?;

    Some(ParsedMatch {
        date: Some(format_unix_millis_date(item.event_date)),
        home: item.home_team.name,
        away: item.away_team.name,
        home_goals,
        away_goals,
    })
}

fn format_unix_millis_date(timestamp_ms: i64) -> String {
    let days = timestamp_ms.div_euclid(86_400_000);
    let (year, month, day) = civil_from_days(days);
    format!("{year:04}-{month:02}-{day:02}")
}

fn civil_from_days(days: i64) -> (i32, u32, u32) {
    let z = days + 719_468;
    let era = if z >= 0 { z } else { z - 146_096 } / 146_097;
    let doe = z - era * 146_097;
    let yoe = (doe - doe / 1_460 + doe / 36_524 - doe / 146_096) / 365;
    let y = yoe + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let day = doy - (153 * mp + 2) / 5 + 1;
    let month = mp + if mp < 10 { 3 } else { -9 };
    let year = y + if month <= 2 { 1 } else { 0 };

    (year as i32, month as u32, day as u32)
}

fn fetch_page(url: &str) -> Result<PagePayload, String> {
    let parsed = Url::parse(url).map_err(|_| "Geçerli bir URL girmen gerekiyor.".to_string())?;
    let domain = parsed
        .domain()
        .unwrap_or("kaynak")
        .trim_start_matches("www.")
        .to_string();

    let client = build_http_client()?;

    let response = client
        .get(url)
        .send()
        .and_then(|r| r.error_for_status())
        .map_err(|e| format!("Link çekilemedi: {e}"))?;

    let html = response
        .text()
        .map_err(|e| format!("Sayfa içeriği okunamadı: {e}"))?;

    let document = Html::parse_document(&html);
    let title = extract_title(&document).unwrap_or_else(|| domain.clone());
    let body_text = extract_body_text(&document);
    let script_text = extract_script_text(&document);
    let merged_text = format!("{}\n{}", body_text, script_text);

    Ok(PagePayload {
        title,
        domain,
        text: normalize_whitespace(&merged_text),
    })
}

fn extract_title(document: &Html) -> Option<String> {
    if let Ok(meta_selector) = Selector::parse("meta[property='og:title']") {
        if let Some(content) = document
            .select(&meta_selector)
            .filter_map(|node| node.value().attr("content"))
            .map(clean_fragment)
            .find(|value| !value.is_empty())
        {
            return Some(content);
        }
    }

    let selector = Selector::parse("title").ok()?;
    document
        .select(&selector)
        .next()
        .map(|node| clean_fragment(&node.text().collect::<Vec<_>>().join(" ")))
        .filter(|value| !value.is_empty())
}

fn extract_body_text(document: &Html) -> String {
    let Ok(selector) = Selector::parse("body") else {
        return String::new();
    };

    document
        .select(&selector)
        .next()
        .map(|body| {
            body.text()
                .map(clean_fragment)
                .filter(|part| !part.is_empty())
                .collect::<Vec<_>>()
                .join("\n")
        })
        .unwrap_or_default()
}

fn extract_script_text(document: &Html) -> String {
    let Ok(selector) = Selector::parse("script") else {
        return String::new();
    };

    document
        .select(&selector)
        .take(80)
        .map(|node| node.text().collect::<Vec<_>>().join(" "))
        .map(|text| clean_fragment(&text))
        .filter(|text| text.contains('-') && text.chars().any(|c| c.is_ascii_digit()))
        .collect::<Vec<_>>()
        .join("\n")
}

fn infer_matchup(
    url: &str,
    page: &PagePayload,
    matches: &[ParsedMatch],
) -> Option<(String, String)> {
    infer_matchup_from_candidates(url, page)
        .or_else(|| infer_matchup_from_context_teams(url, page, matches))
        .or_else(|| infer_matchup_from_pairs(matches))
}

fn infer_matchup_from_candidates(url: &str, page: &PagePayload) -> Option<(String, String)> {
    let mut candidates = vec![page.title.clone()];
    candidates.extend(page.text.lines().take(25).map(|line| line.to_string()));

    if let Ok(parsed) = Url::parse(url) {
        if let Some(slug) = parsed.path_segments().and_then(|segments| {
            segments
                .filter(|part| !part.is_empty())
                .last()
                .map(str::to_string)
        }) {
            candidates.push(slug.replace('-', " ").replace('_', " "));
        }
    }

    for candidate in candidates {
        if let Some((home, away)) = detect_matchup_in_text(&candidate) {
            return Some((home, away));
        }
    }

    None
}

fn infer_matchup_from_context_teams(
    url: &str,
    page: &PagePayload,
    matches: &[ParsedMatch],
) -> Option<(String, String)> {
    let mut context_parts = vec![page.title.clone()];

    if let Ok(parsed) = Url::parse(url) {
        if let Some(slug) = parsed.path_segments().and_then(|segments| {
            segments
                .filter(|part| !part.is_empty())
                .last()
                .map(str::to_string)
        }) {
            context_parts.push(slug.replace('-', " ").replace('_', " "));
        }
    }

    let context = normalize_team_phrase(&context_parts.join(" "));
    if context.is_empty() {
        return None;
    }

    let mut positioned_teams = collect_unique_teams(matches)
        .into_iter()
        .filter_map(|team| find_team_position(&context, &team).map(|position| (position, team)))
        .collect::<Vec<_>>();

    positioned_teams.sort_by_key(|(position, _)| *position);
    positioned_teams
        .dedup_by(|(_, left), (_, right)| normalize_team_name(left) == normalize_team_name(right));

    if positioned_teams.len() < 2 {
        return None;
    }

    Some((positioned_teams[0].1.clone(), positioned_teams[1].1.clone()))
}

fn infer_matchup_from_pairs(matches: &[ParsedMatch]) -> Option<(String, String)> {
    let mut ordered_matches = matches.to_vec();
    sort_matches_by_recent_date(&mut ordered_matches);

    let unique_teams = collect_unique_teams(&ordered_matches);
    if unique_teams.len() == 2 {
        let latest = ordered_matches.first()?;
        return Some((latest.home.clone(), latest.away.clone()));
    }

    let mut pair_counts: HashMap<String, (usize, ParsedMatch)> = HashMap::new();
    for item in ordered_matches {
        let home_key = normalize_team_name(&item.home);
        let away_key = normalize_team_name(&item.away);
        let pair_key = if home_key <= away_key {
            format!("{home_key}|{away_key}")
        } else {
            format!("{away_key}|{home_key}")
        };

        pair_counts
            .entry(pair_key)
            .and_modify(|(count, _)| *count += 1)
            .or_insert((1, item));
    }

    pair_counts
        .into_values()
        .filter(|(count, _)| *count >= 2)
        .max_by_key(|(count, item)| (*count, date_key(item)))
        .map(|(_, item)| (item.home, item.away))
}

fn collect_unique_teams(matches: &[ParsedMatch]) -> Vec<String> {
    let mut teams = Vec::new();
    let mut seen = HashSet::new();

    for item in matches {
        for team in [&item.home, &item.away] {
            let key = normalize_team_name(team);
            if seen.insert(key) {
                teams.push(team.clone());
            }
        }
    }

    teams
}

fn find_team_position(context: &str, team: &str) -> Option<usize> {
    let phrase = normalize_team_phrase(team);
    if phrase.is_empty() {
        return None;
    }

    if let Some(position) = find_whole_phrase_position(context, &phrase) {
        return Some(position);
    }

    let compact_context = context.replace(' ', "");
    let compact_team = phrase.replace(' ', "");
    if compact_team.len() < 6 {
        return None;
    }

    compact_context.find(&compact_team)
}

fn find_whole_phrase_position(haystack: &str, needle: &str) -> Option<usize> {
    haystack.match_indices(needle).find_map(|(start, _)| {
        let end = start + needle.len();
        let left_ok = start == 0 || haystack.as_bytes()[start - 1] == b' ';
        let right_ok = end == haystack.len() || haystack.as_bytes()[end] == b' ';
        if left_ok && right_ok {
            Some(start)
        } else {
            None
        }
    })
}

fn build_matchup_error(matches: &[ParsedMatch]) -> String {
    let unique_team_count = collect_unique_teams(matches).len();

    if unique_team_count <= 1 {
        "Skor satırları bulundu ama iki farklı takım net seçilemedi. Linkteki içerik eksik ya da düzensiz görünüyor.".to_string()
    } else if unique_team_count == 2 {
        "Skor satırları bulundu ama sayfadaki hedef eşleşmenin yönü net seçilemedi. Mümkünse doğrudan maç detay veya H2H linki gir.".to_string()
    } else {
        "Sayfada skorlar bulundu fakat bu link tek takım sonuç veya karma içerik sayfası gibi görünüyor. İki takımı da içeren maç detay ya da H2H linki girmen gerekiyor.".to_string()
    }
}

fn build_no_scores_error(page: &PagePayload) -> String {
    format!(
        "Sayfa geldi ama okunabilir skor satırı çıkarılamadı. Kaynak: {} • {}. Site bot korumalı olabilir ya da skorlar yalnızca JS ile yükleniyor olabilir.",
        page.domain, page.title
    )
}

fn detect_matchup_in_text(text: &str) -> Option<(String, String)> {
    let pattern = Regex::new(
        r"(?iu)([\p{L}0-9][\p{L}0-9 .&'()-]{1,45}?)\s+(?:vs\.?|v\.?|x|karşı|karsi)\s+([\p{L}0-9][\p{L}0-9 .&'()-]{1,45})",
    )
    .ok()?;

    let caps = pattern.captures(text)?;
    let home = sanitize_team_name(caps.get(1)?.as_str());
    let away = sanitize_team_name(caps.get(2)?.as_str());

    if home.len() < 2 || away.len() < 2 || normalize_team_name(&home) == normalize_team_name(&away)
    {
        return None;
    }

    Some((home, away))
}

fn parse_matches(text: &str) -> Vec<ParsedMatch> {
    let score_pattern = Regex::new(
        r"(?iu)(?:(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})\s+)?([\p{L}0-9][\p{L}0-9 .&'()/,-]{1,45}?)\s+(\d{1,2})\s*[-:]\s*(\d{1,2})\s+([\p{L}0-9][\p{L}0-9 .&'()/,-]{1,45})",
    )
    .expect("valid regex");
    let split_score_pattern = Regex::new(
        r"(?iu)(?:(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})\s+)?([\p{L}0-9][\p{L}0-9 .&'()/,-]{1,45}?)\s+(\d{1,2})\s+(\d{1,2})\s+([\p{L}0-9][\p{L}0-9 .&'()/,-]{1,45})",
    )
    .expect("valid regex");

    let mut results = Vec::new();
    let mut seen = HashSet::new();

    for candidate in line_candidates(text) {
        for caps in score_pattern.captures_iter(&candidate) {
            push_parsed_match(&caps, &mut results, &mut seen);
        }

        for caps in split_score_pattern.captures_iter(&candidate) {
            push_parsed_match(&caps, &mut results, &mut seen);
        }
    }

    results
}

fn line_candidates(text: &str) -> Vec<String> {
    let lines: Vec<String> = text
        .lines()
        .map(clean_fragment)
        .filter(|line| line.len() >= 8)
        .collect();

    let mut candidates = Vec::new();
    for idx in 0..lines.len() {
        for span in 1..=5 {
            if idx + span <= lines.len() {
                candidates.push(lines[idx..idx + span].join(" "));
            }
        }
    }
    candidates
}

fn push_parsed_match(
    caps: &regex::Captures<'_>,
    results: &mut Vec<ParsedMatch>,
    seen: &mut HashSet<String>,
) {
    let home = sanitize_team_name(caps.get(2).map(|m| m.as_str()).unwrap_or_default());
    let away = sanitize_team_name(caps.get(5).map(|m| m.as_str()).unwrap_or_default());
    let Some(home_goals) = caps.get(3).and_then(|m| m.as_str().parse::<u8>().ok()) else {
        return;
    };
    let Some(away_goals) = caps.get(4).and_then(|m| m.as_str().parse::<u8>().ok()) else {
        return;
    };

    if !looks_like_team_name(&home) || !looks_like_team_name(&away) {
        return;
    }

    let date = caps.get(1).map(|m| normalize_date(m.as_str()));
    let key = format!(
        "{}|{}|{}|{}|{}",
        date.clone().unwrap_or_default(),
        normalize_team_name(&home),
        home_goals,
        away_goals,
        normalize_team_name(&away)
    );

    if seen.insert(key) {
        results.push(ParsedMatch {
            date,
            home,
            away,
            home_goals,
            away_goals,
        });
    }
}

fn recent_matches_for_team(matches: &[ParsedMatch], team: &str, limit: usize) -> Vec<ParsedMatch> {
    let mut filtered: Vec<ParsedMatch> = matches
        .iter()
        .filter(|item| team_name_matches(&item.home, team) || team_name_matches(&item.away, team))
        .cloned()
        .collect();

    sort_matches_by_recent_date(&mut filtered);
    filtered.truncate(limit);
    filtered
}
fn h2h_matches(
    matches: &[ParsedMatch],
    home_team: &str,
    away_team: &str,
    limit: usize,
) -> Vec<ParsedMatch> {
    let mut filtered: Vec<ParsedMatch> = matches
        .iter()
        .filter(|item| {
            (team_name_matches(&item.home, home_team) && team_name_matches(&item.away, away_team))
                || (team_name_matches(&item.home, away_team)
                    && team_name_matches(&item.away, home_team))
        })
        .cloned()
        .collect();

    sort_matches_by_recent_date(&mut filtered);
    filtered.truncate(limit);
    filtered
}
fn compute_team_stats(matches: &[ParsedMatch], team: &str) -> TeamStats {
    if matches.is_empty() {
        return TeamStats::default();
    }

    let mut ordered = matches.to_vec();
    sort_matches_by_recent_date(&mut ordered);

    let mut scored_total = 0.0;
    let mut conceded_total = 0.0;
    let mut wins = 0usize;
    let mut draws = 0usize;
    let mut losses = 0usize;
    let mut over25 = 0usize;
    let mut over35 = 0usize;
    let mut btts = 0usize;
    let mut clean_sheets = 0usize;
    let mut fail_to_score = 0usize;
    let mut weighted_points_total = 0.0;
    let mut weighted_goal_diff_total = 0.0;
    let mut weight_total = 0.0;

    for (index, item) in ordered.iter().enumerate() {
        let is_home = team_name_matches(&item.home, team);
        let (scored, conceded) = if is_home {
            (item.home_goals as f64, item.away_goals as f64)
        } else {
            (item.away_goals as f64, item.home_goals as f64)
        };
        let points = if scored > conceded {
            3.0
        } else if (scored - conceded).abs() < f64::EPSILON {
            1.0
        } else {
            0.0
        };
        let weight = recency_weight(index);

        scored_total += scored;
        conceded_total += conceded;
        weighted_points_total += points * weight;
        weighted_goal_diff_total += (scored - conceded) * weight;
        weight_total += weight;

        if scored > conceded {
            wins += 1;
        } else if (scored - conceded).abs() < f64::EPSILON {
            draws += 1;
        } else {
            losses += 1;
        }

        if conceded.abs() < f64::EPSILON {
            clean_sheets += 1;
        }
        if scored.abs() < f64::EPSILON {
            fail_to_score += 1;
        }

        let total_goals = item.home_goals as usize + item.away_goals as usize;
        if total_goals >= 3 {
            over25 += 1;
        }
        if total_goals >= 4 {
            over35 += 1;
        }
        if item.home_goals > 0 && item.away_goals > 0 {
            btts += 1;
        }
    }

    let games = ordered.len();
    let games_f64 = games as f64;
    let over25_rate = over25 as f64 / games_f64;
    let over35_rate = over35 as f64 / games_f64;
    let btts_rate = btts as f64 / games_f64;
    let clean_sheet_rate = clean_sheets as f64 / games_f64;
    let fail_to_score_rate = fail_to_score as f64 / games_f64;
    let weighted_points = if weight_total > 0.0 {
        weighted_points_total / weight_total
    } else {
        0.0
    };
    let weighted_goal_diff = if weight_total > 0.0 {
        weighted_goal_diff_total / weight_total
    } else {
        0.0
    };
    let scored_avg = scored_total / games_f64;
    let conceded_avg = conceded_total / games_f64;

    TeamStats {
        games,
        wins,
        draws,
        losses,
        scored_avg,
        conceded_avg,
        over25_rate,
        over35_rate,
        btts_rate,
        clean_sheet_rate,
        fail_to_score_rate,
        weighted_points,
        weighted_goal_diff,
        attack_index: clamp(
            38.0 + scored_avg * 18.0
                + weighted_goal_diff.max(0.0) * 9.0
                + (1.0 - fail_to_score_rate) * 22.0,
            18.0,
            95.0,
        ),
        defense_index: clamp(
            46.0 + (1.65 - conceded_avg).clamp(-1.0, 1.0) * 20.0 + clean_sheet_rate * 24.0
                - btts_rate * 8.0,
            18.0,
            95.0,
        ),
        momentum_index: clamp(
            44.0 + weighted_points * 16.0 + weighted_goal_diff * 12.0,
            15.0,
            94.0,
        ),
        volatility_index: clamp(
            24.0 + over25_rate * 22.0
                + over35_rate * 20.0
                + btts_rate * 16.0
                + fail_to_score_rate * 8.0,
            14.0,
            92.0,
        ),
    }
}

fn recency_weight(index: usize) -> f64 {
    match index {
        0 => 1.30,
        1 => 1.15,
        2 => 1.00,
        3 => 0.90,
        4 => 0.80,
        _ => 0.72,
    }
}

fn average_goals(matches: &[ParsedMatch]) -> f64 {
    if matches.is_empty() {
        return 2.45;
    }

    let total: f64 = matches
        .iter()
        .map(|item| item.home_goals as f64 + item.away_goals as f64)
        .sum();
    total / matches.len() as f64
}

fn compute_h2h_bias(matches: &[ParsedMatch], home_team: &str) -> f64 {
    if matches.is_empty() {
        return 0.0;
    }

    let mut score = 0.0;
    for item in matches {
        let home_is_current_home = team_name_matches(&item.home, home_team);
        let current_home_goals = if home_is_current_home {
            item.home_goals
        } else {
            item.away_goals
        };
        let current_away_goals = if home_is_current_home {
            item.away_goals
        } else {
            item.home_goals
        };

        if current_home_goals > current_away_goals {
            score += 0.08;
        } else if current_home_goals < current_away_goals {
            score -= 0.08;
        }
    }

    clamp(score / matches.len() as f64, -0.10, 0.10)
}

fn to_h2h_rows(matches: &[ParsedMatch], home_team: &str, away_team: &str) -> Vec<H2HMatchRow> {
    if matches.is_empty() {
        return vec![H2HMatchRow {
            date: "-".to_string(),
            score: "Veri yok".to_string(),
            outcome: format!("{} - {} H2H satırı bulunamadı", home_team, away_team),
        }];
    }

    matches
        .iter()
        .map(|item| {
            let outcome = if item.home_goals > item.away_goals {
                format!("{} kazandı", item.home)
            } else if item.home_goals < item.away_goals {
                format!("{} kazandı", item.away)
            } else {
                "Beraberlik".to_string()
            };

            H2HMatchRow {
                date: item.date.clone().unwrap_or_else(|| "Tarih yok".to_string()),
                score: format!(
                    "{} {}-{} {}",
                    item.home, item.home_goals, item.away_goals, item.away
                ),
                outcome,
            }
        })
        .collect()
}

fn is_knockout_competition(league: &str) -> bool {
    let league = league.to_lowercase();
    [
        "kupa",
        "cup",
        "eleme",
        "play-off",
        "playoff",
        "rövanş",
        "yari final",
        "yarı final",
        "ceyrek final",
        "çeyrek final",
        "son 16",
        "son 32",
        "son 8",
        "tur",
        "final",
    ]
    .iter()
    .any(|needle| league.contains(needle))
}

fn build_knockout_adjustment(
    league: &str,
    home_team: &str,
    away_team: &str,
    h2h: &[ParsedMatch],
) -> Option<KnockoutAdjustment> {
    if !is_knockout_competition(league) {
        return None;
    }

    let home_key = normalize_team_name(home_team);
    let away_key = normalize_team_name(away_team);
    let leg = h2h.iter().find(|item| {
        let item_home = normalize_team_name(&item.home);
        let item_away = normalize_team_name(&item.away);
        (item_home == home_key && item_away == away_key)
            || (item_home == away_key && item_away == home_key)
    })?;

    let same_order = normalize_team_name(&leg.home) == home_key;
    let current_home_first_leg_goals = if same_order {
        leg.home_goals
    } else {
        leg.away_goals
    };
    let current_away_first_leg_goals = if same_order {
        leg.away_goals
    } else {
        leg.home_goals
    };
    let margin = current_home_first_leg_goals as i16 - current_away_first_leg_goals as i16;

    let first_leg_score = format!(
        "İlk maç {} {}-{} {} bitti.",
        leg.home, leg.home_goals, leg.away_goals, leg.away
    );

    let (
        aggregate_state,
        tactical_note,
        pressure_note,
        home_side_shift,
        away_side_shift,
        draw_shift,
        home_goal_shift,
        away_goal_shift,
        over_shift,
        btts_shift,
    ) = if margin <= -2 {
        (
                format!("Toplam skorda {} en az iki farkla geride.", home_team),
                format!("{} tur için erken risk almak zorunda; oyun normal lig maçına göre daha açık okunmalı.", home_team),
                format!("{} gol aramak zorunda olduğu için tempo tek taraflı da yükselse üst senaryosu canlı kalır.", home_team),
                0.05,
                -0.01,
                -0.05,
                0.24,
                0.10,
                0.09,
                0.08,
            )
    } else if margin == -1 {
        (
            format!("Toplam skorda {} tek farkla geride.", home_team),
            format!(
                "{} maçı uzatmadan çevirmek isteyeceği için ikinci bölümde baskıyı artırabilir.",
                home_team
            ),
            format!(
                "{} adına kontrollü başlangıç kısa sürebilir; skor baskısı oyunu açabilir.",
                home_team
            ),
            0.03,
            -0.01,
            -0.03,
            0.15,
            0.07,
            0.05,
            0.04,
        )
    } else if margin == 0 {
        (
            "Eşleşme toplam skorda dengede.".to_string(),
            "İlk maç eşit bittiği için bu rövanş tek golle sert kırılabilir.".to_string(),
            "Taraflar skoru beklemek yerine oyunu kazanmaya dönmek zorunda kalabilir.".to_string(),
            0.0,
            0.0,
            -0.01,
            0.08,
            0.08,
            0.04,
            0.03,
        )
    } else if margin == 1 {
        (
                format!("Toplam skorda {} tek farkla önde.", home_team),
                format!("{} skor koruma ile geçiş tehdidi arasında denge kuracak; {} ise daha fazla risk alacak.", home_team, away_team),
                format!("{} geriden geldiği için maçın bir bölümünde tempo sıçrayabilir.", away_team),
                -0.02,
                0.02,
                0.02,
                -0.04,
                0.10,
                0.02,
                0.02,
            )
    } else {
        (
            format!("Toplam skorda {} en az iki farkla önde.", home_team),
            format!(
                "{} için ana hedef maçı yönetmek; {} ise tur için çizgiyi yükseltmek zorunda.",
                home_team, away_team
            ),
            format!(
                "{} risk alacağı için maçın yönü skor ne olursa olsun sertleşebilir.",
                away_team
            ),
            -0.04,
            0.03,
            0.04,
            -0.10,
            0.14,
            0.01,
            0.03,
        )
    };

    Some(KnockoutAdjustment {
        context: KnockoutTieContext {
            title: "Rövanş baskısı".to_string(),
            first_leg_score,
            aggregate_state,
            tactical_note,
            pressure_note,
        },
        home_side_shift,
        away_side_shift,
        draw_shift,
        home_goal_shift,
        away_goal_shift,
        over_shift,
        btts_shift,
    })
}

fn build_form_summary(
    home_team: &str,
    away_team: &str,
    home: &TeamStats,
    away: &TeamStats,
    knockout: Option<&KnockoutAdjustment>,
) -> String {
    let leader = if home.weighted_points > away.weighted_points + 0.18 {
        home_team
    } else if away.weighted_points > home.weighted_points + 0.18 {
        away_team
    } else {
        "iki taraf"
    };

    let base = if leader == "iki taraf" {
        format!(
            "Son form tarafında net kopuş yok. {} {:.2}, {} ise {:.2} ağırlıklı puanda. Bu yüzden maç sonucundan önce tempo ve hata seviyesi belirleyici olacak.",
            home_team, home.weighted_points, away_team, away.weighted_points
        )
    } else {
        format!(
            "Son form {} tarafına eğiliyor. {} {:.2} ağırlıklı puan ve {:.0} momentumla geliyor; {} ise {:.2} seviyesinde kalıyor.",
            leader,
            leader,
            if leader == home_team { home.weighted_points } else { away.weighted_points },
            if leader == home_team { home.momentum_index } else { away.momentum_index },
            if leader == home_team { away_team } else { home_team },
            if leader == home_team { away.weighted_points } else { home.weighted_points }
        )
    };

    if let Some(item) = knockout {
        format!("{} {}", base, item.context.aggregate_state)
    } else {
        base
    }
}

fn build_analyst_verdict(
    home_team: &str,
    away_team: &str,
    _home: &TeamStats,
    _away: &TeamStats,
    probabilities: &Probabilities,
    markets: &MarketBlock,
    projected_goals: f64,
    knockout: Option<&KnockoutAdjustment>,
) -> String {
    let favourite = if probabilities.home_win >= probabilities.away_win {
        home_team
    } else {
        away_team
    };
    let favourite_probability = probabilities.home_win.max(probabilities.away_win);
    let edge = probabilities.home_win.abs_diff(probabilities.away_win);

    let primary_market = if favourite_probability >= 55 && edge >= 10 {
        format!("{} kazanır", favourite)
    } else if markets.over25 >= 61 {
        "2.5 Üst".to_string()
    } else if markets.over25 <= 43 {
        "2.5 Alt".to_string()
    } else if probabilities.home_win >= probabilities.away_win {
        "1X".to_string()
    } else {
        "X2".to_string()
    };

    let base = format!(
        "Ana karar: {}. {} tarafı sonuç çizgisinde %{} ile önde; 2.5 Üst %{}, KG Var %{} ve beklenen gol {:.2} seviyesinde.",
        primary_market,
        favourite,
        favourite_probability,
        markets.over25,
        probabilities.btts_yes,
        projected_goals
    );

    if let Some(item) = knockout {
        format!("{} {}", base, item.context.tactical_note)
    } else {
        base
    }
}

fn build_tactical_summary(
    home_team: &str,
    away_team: &str,
    home: &TeamStats,
    away: &TeamStats,
    probabilities: &Probabilities,
    markets: &MarketBlock,
    projected_goals: f64,
    knockout: Option<&KnockoutAdjustment>,
) -> String {
    let home_pressure = home.attack_index - away.defense_index;
    let away_pressure = away.attack_index - home.defense_index;
    let control_side = if home_pressure > away_pressure + 5.0 {
        format!(
            "{} oyunun yönünü belirlemeye daha yakın görünüyor.",
            home_team
        )
    } else if away_pressure > home_pressure + 5.0 {
        format!(
            "{} geçiş hücumlarıyla dengeyi bozabilecek tarafta.",
            away_team
        )
    } else {
        "İki taraf da orta blokta birbirini uzun süre tartabilir.".to_string()
    };
    let finish_note = if probabilities.btts_yes >= 56 {
        "İki takımın da gol bulma zemini var; savunma hatası oyunu hızla açabilir."
    } else if markets.over25 <= 48 {
        "Gol tavanı erken kırılmaya çok yakın görünmüyor; set oyunu daha belirgin olabilir."
    } else {
        "Skor akışı tek tarafa kayarsa maçın çizgisi kısa sürede değişebilir."
    };

    let base = format!(
        "{} {} Beklenen toplam gol {:.2}; bu yüzden kırılma gelirse maç ikinci bölümde daha sert açılabilir.",
        control_side, finish_note, projected_goals
    );

    if let Some(item) = knockout {
        format!("{} {}", base, item.context.pressure_note)
    } else {
        base
    }
}

fn build_risk_summary(
    home_team: &str,
    away_team: &str,
    home: &TeamStats,
    away: &TeamStats,
    probabilities: &Probabilities,
    h2h_count: usize,
    knockout: Option<&KnockoutAdjustment>,
) -> String {
    let volatility = (home.volatility_index + away.volatility_index) / 2.0;
    let main_risk = if volatility >= 58.0 {
        "Maçın oynaklığı yüksek; erken gol veya kırmızı kart mevcut pazar dengesini hızla bozabilir."
    } else if home.fail_to_score_rate >= 0.40 || away.fail_to_score_rate >= 0.40 {
        "Taraflardan birinin skor üretimi koparsa gol beklentisi aşağı çekilir."
    } else if probabilities.draw >= 30 {
        "Denge uzun süre korunursa beraberlik çizgisi beklenenden daha canlı kalabilir."
    } else {
        "Ana risk, öne çıkan tarafın son vuruş kalitesini sahaya taşıyamamasıdır."
    };
    let sample_note = if h2h_count < 2 {
        "H2H verisi sınırlı olduğu için model daha çok güncel form ve son maç ritmine yaslanıyor."
    } else {
        "H2H serisi mevcut, ancak kararın ana omurgasını güncel ritim kuruyor."
    };
    let team_note = format!(
        "{} için gol yemeden bitirme oranı %{:.0}, {} için skor üretememe riski %{:.0} seviyesinde.",
        home_team,
        home.clean_sheet_rate * 100.0,
        away_team,
        away.fail_to_score_rate * 100.0
    );

    if let Some(item) = knockout {
        format!(
            "{} {} {} {}",
            main_risk, sample_note, team_note, item.context.pressure_note
        )
    } else {
        format!("{} {} {}", main_risk, sample_note, team_note)
    }
}

fn build_narrative(
    home_team: &str,
    away_team: &str,
    home: &TeamStats,
    away: &TeamStats,
    probabilities: &Probabilities,
    markets: &MarketBlock,
    projected_goals: f64,
    h2h: &[ParsedMatch],
    knockout: Option<&KnockoutAdjustment>,
) -> String {
    let verdict = build_analyst_verdict(
        home_team,
        away_team,
        home,
        away,
        probabilities,
        markets,
        projected_goals,
        knockout,
    );
    let tactical = build_tactical_summary(
        home_team,
        away_team,
        home,
        away,
        probabilities,
        markets,
        projected_goals,
        knockout,
    );
    let risk = build_risk_summary(
        home_team,
        away_team,
        home,
        away,
        probabilities,
        h2h.len(),
        knockout,
    );

    format!("{} {} {}", verdict, tactical, risk)
}

fn build_analysis_pillars(
    home_team: &str,
    away_team: &str,
    home: &TeamStats,
    away: &TeamStats,
    probabilities: &Probabilities,
    projected_goals: f64,
) -> Vec<AnalysisPillar> {
    let form_score = clamp(
        48.0 + (home.weighted_points - away.weighted_points).abs() * 28.0,
        28.0,
        91.0,
    )
    .round() as u8;
    let attack_score = clamp(
        ((home.attack_index + away.attack_index) / 2.0) + projected_goals * 6.0,
        30.0,
        94.0,
    )
    .round() as u8;
    let defense_score =
        clamp((home.defense_index + away.defense_index) / 2.0, 25.0, 90.0).round() as u8;
    let tempo_score = clamp(
        40.0 + projected_goals * 14.0
            + ((home.volatility_index + away.volatility_index) / 2.0 - 50.0) * 0.4,
        24.0,
        93.0,
    )
    .round() as u8;
    let form_side = if home.weighted_points >= away.weighted_points {
        home_team
    } else {
        away_team
    };
    let result_side = if probabilities.home_win >= probabilities.away_win {
        home_team
    } else {
        away_team
    };

    vec![
        AnalysisPillar {
            title: "Form kontrolü".to_string(),
            score: form_score,
            summary: format!(
                "Ağırlıklı son maç okumasında {} bir adım önde. Ritmi daha az bozulan taraf bu başlıkta avantajlı.",
                form_side
            ),
        },
        AnalysisPillar {
            title: "Hücum sürekliliği".to_string(),
            score: attack_score,
            summary: format!(
                "İki ekip birlikte okunduğunda skor potansiyeli canlı. Sonuç tarafında {} lehine ince bir üstünlük var.",
                result_side
            ),
        },
        AnalysisPillar {
            title: "Savunma direnci".to_string(),
            score: defense_score,
            summary: "Savunma direnci maçı tek tarafa kaydırabilecek unsur. Gol yemeden bitirme oranı ve yenilen gol ritmi burada hesaba katıldı.".to_string(),
        },
        AnalysisPillar {
            title: "Maç temposu".to_string(),
            score: tempo_score,
            summary: format!(
                "Beklenen toplam gol {:.2}. Bu veri, oyunun kontrollü mü yoksa açık mı akacağına dair ana işareti veriyor.",
                projected_goals
            ),
        },
    ]
}

fn build_scenario_cards(
    home_team: &str,
    away_team: &str,
    probabilities: &Probabilities,
    markets: &MarketBlock,
    projected_goals: f64,
) -> Vec<ScenarioCard> {
    let favourite_is_home = probabilities.home_win >= probabilities.away_win;
    let favourite_team = if favourite_is_home {
        home_team
    } else {
        away_team
    };
    let favourite_probability = probabilities.home_win.max(probabilities.away_win);
    let control_probability = if projected_goals <= 2.45 {
        (100 - markets.over25).max(probabilities.draw)
    } else {
        markets.over25.max(probabilities.draw)
    };
    let goal_probability = if probabilities.btts_yes >= probabilities.btts_no {
        probabilities.btts_yes.max(markets.over25)
    } else {
        probabilities.btts_no.max(100 - markets.over35)
    };

    vec![
        ScenarioCard {
            label: format!("{} senaryosu", favourite_team),
            probability: favourite_probability,
            summary: if favourite_probability as i16 - probabilities.draw as i16 >= 8 {
                format!(
                    "Sonuç pazarında en temiz eğim {} tarafında. Ancak kenar çok açık değil; tempo değişirse tahmin daralabilir.",
                    favourite_team
                )
            } else if favourite_is_home {
                format!(
                    "Net taraf yerine 1X koruması daha mantıklı. Bu bantta {} yenilmez senaryosu öne çıkıyor.",
                    home_team
                )
            } else {
                format!(
                    "Net taraf yerine X2 koruması daha mantıklı. Bu bantta {} yenilmez senaryosu öne çıkıyor.",
                    away_team
                )
            },
        },
        ScenarioCard {
            label: "Oyun akışı".to_string(),
            probability: control_probability,
            summary: if projected_goals <= 2.45 {
                "Tempo bir süre kontrol altında kalırsa sabır isteyen, skor tavanının geç açıldığı bir maç izlenebilir.".to_string()
            } else {
                "Pozisyon kalitesi arttıkça çizgiler daha çabuk kırılabilir; oyunun açılma riski canlı.".to_string()
            },
        },
        ScenarioCard {
            label: "Gol resmi".to_string(),
            probability: goal_probability,
            summary: if probabilities.btts_yes >= probabilities.btts_no {
                "İki tarafın da fileyi bulma ihtimali masada. Oyun erken açılırsa KG Var tarafı güçlenir.".to_string()
            } else {
                "Skorun tek tarafa akması daha olası. Bu durumda KG Yok veya daha kontrollü total pazarı destek kazanır.".to_string()
            },
        },
    ]
}

fn build_insight_notes(
    home_team: &str,
    away_team: &str,
    home: &TeamStats,
    away: &TeamStats,
    h2h_count: usize,
    projected_goals: f64,
) -> Vec<InsightNote> {
    vec![
        InsightNote {
            title: "Ağırlıklı momentum".to_string(),
            detail: format!(
                "{} {:.2} ağırlıklı puanla geliyor, {} ise {:.2}. Son maça daha fazla ağırlık verildiği için kısa vadeli ritim doğrudan modele yansıyor.",
                home_team,
                home.weighted_points,
                away_team,
                away.weighted_points
            ),
        },
        InsightNote {
            title: "Savunma eşiği".to_string(),
            detail: format!(
                "{} clean sheet oranı %{:.0}, {} clean sheet oranı %{:.0}. Bu fark, skorun bir taraf lehine kilitlenip kilitlenmeyeceğini belirliyor.",
                home_team,
                home.clean_sheet_rate * 100.0,
                away_team,
                away.clean_sheet_rate * 100.0
            ),
        },
        InsightNote {
            title: "Veri kapsamı".to_string(),
            detail: if h2h_count < 2 {
                format!(
                    "H2H örneği sınırlı. Bu nedenle {:.2} gol projeksiyonu ve son form trendi, geçmiş rekabetten daha baskın kullanıldı.",
                    projected_goals
                )
            } else {
                format!(
                    "{} adet H2H satırı mevcut. Bu seri, {:.2} gol projeksiyonunun yalnızca takvim etkisi değil, eşleşme dinamiğiyle de desteklendiğini gösteriyor.",
                    h2h_count,
                    projected_goals
                )
            },
        },
    ]
}

fn build_recommendations(
    home_team: &str,
    away_team: &str,
    home: &TeamStats,
    away: &TeamStats,
    probabilities: &Probabilities,
    markets: &MarketBlock,
    projected_goals: f64,
    knockout: Option<&KnockoutAdjustment>,
) -> Vec<Recommendation> {
    let mut picks = Vec::new();
    let home_double = (probabilities.home_win as u16 + probabilities.draw as u16).min(95) as u8;
    let away_double = (probabilities.away_win as u16 + probabilities.draw as u16).min(95) as u8;
    let edge = probabilities.home_win.abs_diff(probabilities.away_win);
    let knockout_note = knockout
        .map(|item| format!(" {}", item.context.pressure_note))
        .unwrap_or_default();

    if edge >= 10 {
        let (market, probability, reason) = if probabilities.home_win >= probabilities.away_win {
            (
                format!("1 ({})", home_team),
                probabilities.home_win,
                format!(
                    "{} son form ve savunma direncinde önde. {:.2} - {:.2} ritmi sonucu bu tarafa itiyor.{}",
                    home_team, home.weighted_points, away.weighted_points, knockout_note
                ),
            )
        } else {
            (
                format!("2 ({})", away_team),
                probabilities.away_win,
                format!(
                    "{} tarafı momentum ve geçiş tehdidinde daha canlı. {:.2} - {:.2} ritmi deplasman senaryosunu açık tutuyor.{}",
                    away_team, away.weighted_points, home.weighted_points, knockout_note
                ),
            )
        };
        picks.push((market, probability, reason));
    } else if probabilities.home_win >= probabilities.away_win {
        picks.push((
            "1X".to_string(),
            home_double,
            format!(
                "Taraf farkı sınırlı. {} yenilmez çizgisi doğrudan sonuca göre daha temiz görünüyor.{}",
                home_team, knockout_note
            ),
        ));
    } else {
        picks.push((
            "X2".to_string(),
            away_double,
            format!(
                "Taraf farkı sınırlı. {} yenilmez çizgisi doğrudan sonuca göre daha temiz görünüyor.{}",
                away_team, knockout_note
            ),
        ));
    }

    if markets.over25 >= 57 {
        picks.push((
            "2.5 Üst".to_string(),
            markets.over25,
            format!(
                "Projeksiyon {:.2} gol. Tempo ve iki tarafın skor üretim zemini üst pazarını destekliyor.{}",
                projected_goals, knockout_note
            ),
        ));
    } else if (100 - markets.over25) >= 56 {
        picks.push((
            "2.5 Alt".to_string(),
            100 - markets.over25,
            format!(
                "Projeksiyon {:.2} gol bandında kaldığı için 2.5 Alt tarafı önde. Erken gol gelmezse maç daha kontrollü akabilir.{}",
                projected_goals, knockout_note
            ),
        ));
    } else {
        picks.push((
            "3.5 Alt".to_string(),
            100 - markets.over35,
            format!(
                "Tavan gol ihtimali sınırlı. {:.2} gol projeksiyonu daha kontrollü bir çizgi veriyor.{}",
                projected_goals, knockout_note
            ),
        ));
    }

    if probabilities.btts_yes >= 56 {
        picks.push((
            "KG Var".to_string(),
            probabilities.btts_yes,
            format!(
                "İki taraf da gol eşiğine yakın. Savunma dirençleri maçı tamamen kapatacak kadar sert görünmüyor.{}",
                knockout_note
            ),
        ));
    } else if probabilities.btts_no >= 56 {
        picks.push((
            "KG Yok".to_string(),
            probabilities.btts_no,
            format!(
                "Taraflardan birinin skor üretimi koparsa maç tek kanattan akabilir.{}",
                knockout_note
            ),
        ));
    } else {
        picks.push((
            "Beraberlik".to_string(),
            probabilities.draw,
            "Denge uzun süre korunursa skorun belirli bölümde kilitli kalma ihtimali masada."
                .to_string(),
        ));
    }

    picks.sort_by(|a, b| b.1.cmp(&a.1));
    picks
        .into_iter()
        .take(3)
        .map(|(market, probability, reason)| Recommendation {
            market,
            probability,
            reason,
            risk_label: risk_label(probability).0.to_string(),
            risk_class: risk_label(probability).1.to_string(),
        })
        .collect()
}

fn risk_label(probability: u8) -> (&'static str, &'static str) {
    if probability >= 72 {
        ("Daha güvenli", "safe")
    } else if probability >= 58 {
        ("Dengeli", "medium")
    } else {
        ("Agresif", "risky")
    }
}

fn compute_confidence(
    home: &TeamStats,
    away: &TeamStats,
    probabilities: &Probabilities,
    projected_goals: f64,
    h2h_count: usize,
) -> u8 {
    let edge =
        probabilities.home_win.max(probabilities.away_win) as f64 - probabilities.draw as f64;
    let structural_gap = (home.momentum_index - away.momentum_index).abs() * 0.24
        + (home.defense_index - away.defense_index).abs() * 0.10;
    let sample_bonus = ((home.games + away.games + h2h_count).min(15) as f64) * 1.35;
    let raw =
        43.0 + edge * 0.48 + structural_gap + (projected_goals - 2.45).abs() * 3.4 + sample_bonus;
    clamp(raw, 50.0, 89.0).round() as u8
}

fn compute_signal_coverage(
    h2h_count: usize,
    venue_sample_ready: bool,
    standings_ready: bool,
    absence_ready: bool,
) -> (u8, f64, String) {
    let mut score: i32 = 42;
    score += match h2h_count {
        0 => 0,
        1 => 7,
        2 => 11,
        _ => 16,
    };
    if venue_sample_ready {
        score += 14;
    }
    if standings_ready {
        score += 15;
    }
    if absence_ready {
        score += 13;
    }
    let score = score.clamp(35, 96) as u8;
    let confidence_delta = if score < 55 {
        -clamp((55 - score) as f64 * 0.20, 1.0, 5.5)
    } else {
        clamp((score - 65) as f64 * 0.05, 0.0, 2.5)
    };

    let mut missing = Vec::new();
    if h2h_count == 0 {
        missing.push("H2H örneği yok");
    } else if h2h_count < 2 {
        missing.push("H2H örneği düşük");
    }
    if !venue_sample_ready {
        missing.push("iç saha/deplasman örneklemi sınırlı");
    }
    if !standings_ready {
        missing.push("puan tablosu sinyali eksik");
    }
    if !absence_ready {
        missing.push("sakat/cezalı sinyali zayıf");
    }

    let summary = if missing.is_empty() {
        format!(
            "Veri kapsaması güçlü (%{}). Form, H2H, saha dengesi, puan tablosu ve kadro sinyali birlikte kullanıldı.",
            score
        )
    } else {
        format!(
            "Veri kapsaması orta/düşük (%{}): {}. Güven skoru temkinli ayarlandı.",
            score,
            missing.join(", ")
        )
    };
    (score, confidence_delta, summary)
}

fn percentage(value: f64) -> u8 {
    (value * 100.0).round().clamp(1.0, 99.0) as u8
}

fn probability_from_rate(value: f64, min: f64, max: f64) -> u8 {
    percentage(clamp(value, min, max))
}

fn over_under_note(probability: u8, over_label: &str, under_label: &str) -> String {
    if probability >= 58 {
        format!("{} tarafı daha sıcak.", over_label)
    } else if probability <= 44 {
        format!("{} tarafı daha dengeli.", under_label)
    } else {
        "Net ayrışma yok, maç akışına duyarlı market.".to_string()
    }
}

fn first_known_date(matches: &[ParsedMatch]) -> Option<String> {
    let mut ordered = matches.to_vec();
    sort_matches_by_recent_date(&mut ordered);
    ordered.into_iter().find_map(|item| item.date)
}

fn sort_matches_by_recent_date(matches: &mut [ParsedMatch]) {
    matches.sort_by(|left, right| match (date_key(left), date_key(right)) {
        (Some(left_date), Some(right_date)) => right_date.cmp(&left_date),
        (Some(_), None) => std::cmp::Ordering::Less,
        (None, Some(_)) => std::cmp::Ordering::Greater,
        (None, None) => std::cmp::Ordering::Equal,
    });
}

fn date_key(item: &ParsedMatch) -> Option<(i32, u32, u32)> {
    item.date.as_deref().and_then(parse_date_key)
}

fn parse_date_key(input: &str) -> Option<(i32, u32, u32)> {
    let normalized = normalize_date(input);
    let parts: Vec<&str> = normalized.split('-').collect();
    if parts.len() != 3 {
        return None;
    }

    let parse_year = |value: &str| -> Option<i32> {
        if value.len() == 2 {
            Some(2000 + value.parse::<i32>().ok()?)
        } else {
            value.parse::<i32>().ok()
        }
    };

    let (year, month, day) = if parts[0].len() == 4 {
        (
            parse_year(parts[0])?,
            parts[1].parse::<u32>().ok()?,
            parts[2].parse::<u32>().ok()?,
        )
    } else {
        (
            parse_year(parts[2])?,
            parts[1].parse::<u32>().ok()?,
            parts[0].parse::<u32>().ok()?,
        )
    };

    if !(1..=12).contains(&month) || !(1..=31).contains(&day) {
        return None;
    }

    Some((year, month, day))
}
fn clean_fragment(input: &str) -> String {
    input
        .replace('\u{a0}', " ")
        .replace('\t', " ")
        .replace("\u{200b}", " ")
        .split_whitespace()
        .collect::<Vec<_>>()
        .join(" ")
        .trim()
        .to_string()
}

fn normalize_whitespace(input: &str) -> String {
    input
        .lines()
        .map(clean_fragment)
        .filter(|line| !line.is_empty())
        .collect::<Vec<_>>()
        .join("\n")
}

fn sanitize_team_name(input: &str) -> String {
    let value = clean_fragment(input);
    let pattern = Regex::new(
        r"(?iu)\s+(h2h|head to head|statistics|stats|canli skor|canlı skor|live score|lineups|kadrolar|results|sonuçları|sonuclari|fikstur|fixture|odds|oranlar)$",
    )
    .expect("valid sanitize regex");

    pattern
        .replace(&value, "")
        .trim_matches(|c: char| !c.is_alphanumeric() && !c.is_whitespace())
        .trim()
        .to_string()
}

fn normalize_team_name(input: &str) -> String {
    normalize_team_phrase(input)
        .chars()
        .filter(|c| c.is_ascii_alphanumeric())
        .collect::<String>()
}

fn normalize_team_phrase(input: &str) -> String {
    let mut normalized = String::with_capacity(input.len());
    for ch in input.chars() {
        let mapped = match ch {
            '\u{00E7}' | '\u{00C7}' => 'c',
            '\u{011F}' | '\u{011E}' => 'g',
            '\u{0131}' | 'I' | '\u{0130}' => 'i',
            '\u{00F6}' | '\u{00D6}' => 'o',
            '\u{015F}' | '\u{015E}' => 's',
            '\u{00FC}' | '\u{00DC}' => 'u',
            _ => ch.to_ascii_lowercase(),
        };

        if mapped.is_ascii_alphanumeric() {
            normalized.push(mapped);
        } else {
            normalized.push(' ');
        }
    }

    normalized.split_whitespace().collect::<Vec<_>>().join(" ")
}

fn contains_whole_phrase(haystack: &str, needle: &str) -> bool {
    find_whole_phrase_position(haystack, needle).is_some()
}
fn looks_like_team_name(input: &str) -> bool {
    let normalized = normalize_team_name(input);
    normalized.len() >= 3 && normalized.chars().any(|c| c.is_ascii_alphabetic())
}

fn team_name_matches(candidate: &str, target: &str) -> bool {
    let left_phrase = normalize_team_phrase(candidate);
    let right_phrase = normalize_team_phrase(target);

    if left_phrase.is_empty() || right_phrase.is_empty() {
        return false;
    }

    if left_phrase == right_phrase {
        return true;
    }

    if contains_whole_phrase(&left_phrase, &right_phrase)
        || contains_whole_phrase(&right_phrase, &left_phrase)
    {
        return true;
    }

    let left_compact = left_phrase.replace(' ', "");
    let right_compact = right_phrase.replace(' ', "");

    left_compact == right_compact
        || (left_compact.len() >= 8
            && right_compact.len() >= 8
            && (left_compact.starts_with(&right_compact)
                || right_compact.starts_with(&left_compact)))
}
fn normalize_date(input: &str) -> String {
    clean_fragment(input).replace('.', "-").replace('/', "-")
}

fn clamp(value: f64, min: f64, max: f64) -> f64 {
    value.max(min).min(max)
}

#[derive(Clone, Debug, Deserialize)]
struct MackolikLiveBundle {
    #[serde(default)]
    m: Vec<Vec<Value>>,
    #[serde(default)]
    e: Vec<Vec<Value>>,
}

#[derive(Clone, Debug)]
struct MackolikListedMatch {
    match_page_id: u64,
    event_id: Option<u64>,
    sport_id: u32,
    home_team_id: Option<u64>,
    away_team_id: Option<u64>,
    home_team: String,
    away_team: String,
    home_goals: Option<u8>,
    away_goals: Option<u8>,
    match_date: String,
    match_time: String,
    match_status: String,
    league: String,
}

#[derive(Clone, Debug)]
struct MackolikLiveRow {
    match_page_id: u64,
    league: String,
    home_team_id: Option<u64>,
    away_team_id: Option<u64>,
    home_team: String,
    away_team: String,
    home_goals: u8,
    away_goals: u8,
    minute_label: String,
}

#[derive(Clone, Debug, Default)]
struct MackolikMatchDetail {
    status_text: String,
    score_text: Option<String>,
    halftime_score: Option<String>,
    fulltime_score: Option<String>,
    penalties_score: Option<String>,
    timeline_events: Vec<TrackedTimelineEvent>,
}

#[derive(Clone, Debug)]
struct MackolikTimelineSeed {
    minute_value: u16,
    minute: String,
    event_type: String,
    side: String,
    label: String,
    note: String,
    score: Option<String>,
}

#[derive(Clone, Debug)]
struct LiveMarketPlan {
    first_half_label: String,
    first_half_probability: u8,
    first_half_note: String,
    secondary_label: String,
    secondary_probability: u8,
    secondary_note: String,
    result_label: String,
    result_probability: u8,
    result_note: String,
    live_comment: String,
}

pub fn scan_daily_program_url(
    url: &str,
    ai_request: Option<AiRequest>,
    data_request: Option<DataSourceRequest>,
    scan_request: Option<DailyScanRequest>,
    options: Option<AnalysisOptionsRequest>,
    calibration_profile: Option<CalibrationProfileRequest>,
) -> Result<DailyScanResponse, String> {
    let options = options.unwrap_or_default();
    let sharp_mode = options.sharp_mode.unwrap_or(false);
    let auto_track_scan = options.auto_track_scan.unwrap_or(false);
    let scan_request = scan_request.unwrap_or_default();
    let scan_date = scan_request
        .selected_date
        .clone()
        .filter(|value| !value.trim().is_empty())
        .unwrap_or_else(today_iso_date);
    let sport_name = extract_program_sport_name(url).unwrap_or_else(|| "futbol".to_string());
    let sport_id = iddaa_sport_id(&sport_name).unwrap_or(1);
    let min_confidence = scan_request.min_confidence.unwrap_or(80).clamp(45, 96);
    let league_filters = normalize_filter_terms(scan_request.league_filters);
    let league_whitelist = normalize_filter_terms(scan_request.league_whitelist);
    let league_blacklist = normalize_filter_terms(scan_request.league_blacklist);

    let client = build_http_client()?;
    let competition_names = fetch_iddaa_competition_names(&client).unwrap_or_default();
    let program_events = fetch_iddaa_program_events(&client)?;
    let mut listed_matches =
        parse_iddaa_listed_matches(&program_events, &competition_names, &scan_date, sport_id)
            .into_iter()
            .filter(listed_match_is_upcoming)
            .collect::<Vec<_>>();
    listed_matches.sort_by(|left, right| {
        left.match_date
            .cmp(&right.match_date)
            .then_with(|| left.match_time.cmp(&right.match_time))
    });
    let candidate_count = listed_matches.len();
    if candidate_count == 0 {
        return Err(format!("{scan_date} için taranabilir maç bulunamadı."));
    }

    let scan_cap = if sharp_mode { 5 } else { 8 };
    let mut scanned_count = 0usize;
    let mut analyzed_count = 0usize;
    let mut failed_count = 0usize;
    let mut picks = Vec::new();

    for item in listed_matches.into_iter().take(scan_cap) {
        scanned_count += 1;
        let event_id = item.event_id.unwrap_or(item.match_page_id);
        let detail_url = build_match_detail_url(&sport_name, item.sport_id, event_id);
        let mut nested_options = options.clone();
        nested_options.light_scan = Some(true);
        let analysis = match analyze_match_url(
            &detail_url,
            ai_request.clone(),
            data_request.clone(),
            Some(nested_options),
            calibration_profile.clone(),
        ) {
            Ok(value) => value,
            Err(_) => {
                failed_count += 1;
                continue;
            }
        };
        analyzed_count += 1;
        if !passes_league_policy(
            &analysis.match_info.league,
            &league_filters,
            &league_whitelist,
            &league_blacklist,
        ) {
            continue;
        }
        let primary = analysis
            .recommendations
            .first()
            .cloned()
            .unwrap_or_else(|| Recommendation {
                market: "Uzak Dur".to_string(),
                probability: analysis.confidence_score,
                reason: "Bu maç için güçlü bir ayrışma oluşmadı.".to_string(),
                risk_label: "Dengeli".to_string(),
                risk_class: "medium".to_string(),
            });
        let safe = analysis
            .recommendations
            .get(1)
            .cloned()
            .unwrap_or_else(|| primary.clone());
        picks.push(DailyScanPick {
            rank: 0,
            event_id,
            detail_url,
            reliability_score: analysis.confidence_score,
            result_code: primary.market.clone(),
            result_label: primary.market.clone(),
            result_probability: primary.probability,
            safe_market: safe.market,
            safe_market_probability: safe.probability,
            analysis,
        });
        if picks.len() >= 6 {
            break;
        }
    }

    picks.sort_by(|left, right| {
        right
            .reliability_score
            .cmp(&left.reliability_score)
            .then_with(|| right.result_probability.cmp(&left.result_probability))
    });
    for (index, item) in picks.iter_mut().enumerate() {
        item.rank = (index + 1) as u8;
    }
    let top_picks = picks
        .iter()
        .filter(|item| item.reliability_score >= min_confidence)
        .take(5)
        .cloned()
        .collect::<Vec<_>>();
    let avoid_picks = picks.iter().rev().take(3).cloned().collect::<Vec<_>>();
    let qualified_count = top_picks.len();
    let matched_count = picks.len();

    Ok(DailyScanResponse {
        source_url: url.to_string(),
        source_label: format!("Günlük program • {sport_name}"),
        scan_date,
        sharp_mode,
        auto_track_scan,
        league_filters,
        league_whitelist,
        league_blacklist,
        min_confidence,
        candidate_count,
        scanned_count,
        analyzed_count,
        matched_count,
        qualified_count,
        failed_count,
        top_picks,
        avoid_picks,
        coupon_packages: Vec::<CouponPackage>::new(),
        summary_note: if qualified_count > 0 {
            format!(
                "Tarama tamamlandı. Güven eşiğini geçen {} maç ayrıldı.",
                qualified_count
            )
        } else {
            "Tarama tamamlandı fakat güven eşiğini geçen maç çıkmadı.".to_string()
        },
    })
}

pub fn scan_live_matches_url(
    url: &str,
    ai_request: Option<AiRequest>,
    data_request: Option<DataSourceRequest>,
    options: Option<AnalysisOptionsRequest>,
    calibration_profile: Option<CalibrationProfileRequest>,
) -> Result<LiveScanResponse, String> {
    let sport_name = extract_live_program_sport_name(url).unwrap_or_else(|| "futbol".to_string());
    let sport_id = iddaa_sport_id(&sport_name).unwrap_or(1);
    let today = today_iso_date();
    let client = build_http_client()?;
    let competition_names = fetch_iddaa_competition_names(&client).unwrap_or_default();
    let listed_events = fetch_iddaa_program_events(&client).unwrap_or_default();
    let live_events = fetch_iddaa_live_events(&client).unwrap_or_else(|_| listed_events.clone());
    let listed_program_matches =
        parse_iddaa_listed_matches(&listed_events, &competition_names, &today, sport_id);
    let listed_live_matches =
        parse_iddaa_listed_matches(&live_events, &competition_names, &today, sport_id);
    let mut listed_by_match = HashMap::<u64, MackolikListedMatch>::new();
    for item in listed_program_matches
        .into_iter()
        .chain(listed_live_matches.into_iter())
    {
        listed_by_match.entry(item.match_page_id).or_insert(item);
    }
    let listed = listed_by_match.into_values().collect::<Vec<_>>();
    let mut live_rows = parse_iddaa_live_rows(&live_events, &competition_names, sport_id);
    if live_rows.is_empty() {
        return Ok(LiveScanResponse {
            source_url: url.to_string(),
            source_label: format!("Canlı program • {sport_name}"),
            live_count: 0,
            analyzed_count: 0,
            summary_note: "Canlı listede yorumlanabilir maç bulunamadı.".to_string(),
            picks: Vec::new(),
        });
    }
    live_rows.sort_by(|left, right| compare_mackolik_live_rows(right, left));

    let detail_client = build_http_client().ok();
    let mut picks = Vec::new();
    let mut analyzed_count = 0usize;
    for live_row in live_rows
        .into_iter()
        .filter(|item| {
            let state = parse_mackolik_live_state(&item.minute_label);
            let minute = parse_live_minute_value(&item.minute_label);
            (state == "live" && minute <= 120) || state == "halftime"
        })
        .take(8)
    {
        let matched = listed
            .iter()
            .find(|item| {
                item.match_page_id == live_row.match_page_id
                    || ((item.home_team_id.is_some() && item.home_team_id == live_row.home_team_id)
                        && (item.away_team_id.is_some()
                            && item.away_team_id == live_row.away_team_id))
                    || (team_name_matches(&item.home_team, &live_row.home_team)
                        && team_name_matches(&item.away_team, &live_row.away_team))
            })
            .cloned();
        let Some(matched) = matched else {
            continue;
        };
        let detail_url = matched
            .event_id
            .map(|event_id| build_match_detail_url(&sport_name, matched.sport_id, event_id))
            .unwrap_or_default();
        let mut analysis = if !detail_url.is_empty() {
            let mut nested_options = options.clone().unwrap_or_default();
            nested_options.light_scan = Some(true);
            analyze_match_url(
                &detail_url,
                ai_request.clone(),
                data_request.clone(),
                Some(nested_options),
                calibration_profile.clone(),
            )
            .unwrap_or_else(|_| build_fallback_analysis(&live_row, Some(&matched), &detail_url))
        } else {
            build_fallback_analysis(&live_row, Some(&matched), &detail_url)
        };
        analyzed_count += 1;
        let mut tracked_status = build_tracked_status_from_live_row(
            &live_row,
            Some(&matched),
            "Canlı skor akışı güncellendi.",
            None,
        );
        if should_enrich_with_mackolik_detail(&tracked_status) {
            if let (Some(client), Some(match_page_id)) = (
                detail_client.as_ref(),
                tracked_status
                    .mackolik_match_page_id
                    .filter(|value| *value > 0),
            ) {
                if let Ok(detail) =
                    fetch_mackolik_match_detail(client, match_page_id, &tracked_status.state)
                {
                    tracked_status = merge_match_detail_into_tracked_status(tracked_status, detail);
                }
            }
        }

        let live_plan =
            build_live_market_plan(&live_row, Some(&matched), &analysis, Some(&tracked_status));
        analysis.ai_narrative = live_plan.live_comment.clone();
        analysis.analyst_verdict = format!(
            "Ana karar: {} (%{}). {}",
            live_plan.result_label, live_plan.result_probability, live_plan.result_note
        );
        tracked_status.note = live_plan.live_comment.clone();
        picks.push(LiveMatchPick {
            rank: 0,
            event_id: matched.event_id.unwrap_or(live_row.match_page_id),
            detail_url,
            minute_label: live_row.minute_label.clone(),
            live_score: format!("{}-{}", live_row.home_goals, live_row.away_goals),
            halftime_score: tracked_status.halftime_score.clone(),
            first_half_over05_probability: live_plan.first_half_probability,
            first_half_market_label: live_plan.first_half_label,
            first_half_note: live_plan.first_half_note,
            secondary_market_label: live_plan.secondary_label,
            secondary_market_probability: live_plan.secondary_probability,
            secondary_market_note: live_plan.secondary_note,
            result_market_label: live_plan.result_label,
            result_market_probability: live_plan.result_probability,
            result_market_note: live_plan.result_note,
            live_comment: live_plan.live_comment,
            tracked_status,
            analysis,
        });
    }

    picks.sort_by(|left, right| {
        right
            .analysis
            .confidence_score
            .cmp(&left.analysis.confidence_score)
            .then_with(|| {
                right
                    .result_market_probability
                    .cmp(&left.result_market_probability)
            })
    });
    for (index, item) in picks.iter_mut().enumerate() {
        item.rank = (index + 1) as u8;
    }
    let live_count = picks.len();

    Ok(LiveScanResponse {
        source_url: url.to_string(),
        source_label: format!("Canlı program • {sport_name}"),
        live_count,
        analyzed_count,
        summary_note: if live_count == 0 {
            "Canlı listede filtreyi geçen maç kalmadı.".to_string()
        } else {
            format!("Canlı programdan {} maç yorumlandı.", live_count)
        },
        picks,
    })
}

pub fn refresh_tracked_matches(
    matches: Vec<TrackedMatchRequest>,
    _data_request: Option<DataSourceRequest>,
) -> Result<Vec<TrackedMatchStatus>, String> {
    if matches.is_empty() {
        return Ok(Vec::new());
    }
    let today = today_iso_date();
    let today_listed_bundle = fetch_mackolik_live_bundle(&today)?;
    let today_live_bundle =
        fetch_mackolik_live_now_bundle().unwrap_or_else(|_| today_listed_bundle.clone());
    let mut cache = HashMap::<String, MackolikLiveBundle>::new();
    cache.insert(today.clone(), today_listed_bundle);
    let detail_client = build_http_client().ok();
    let mut results = Vec::with_capacity(matches.len());

    for request in matches {
        let can_use_flashscore = request.mackolik_match_page_id.is_none();
        if can_use_flashscore {
            if let Some(url) = request
                .url
                .as_deref()
                .filter(|value| is_flashscore_match_url(value))
            {
                if let Ok(status) = fetch_flashscore_match_status(url, &request) {
                    results.push(status);
                    continue;
                }
            }
        }

        let request_date = if request.match_date.trim().is_empty() {
            today.clone()
        } else {
            request.match_date.clone()
        };
        if !cache.contains_key(&request_date) {
            if let Ok(bundle) = fetch_mackolik_live_bundle(&request_date) {
                cache.insert(request_date.clone(), bundle);
            }
        }
        let request_bundle = cache.get(&request_date).or_else(|| cache.get(&today));
        let live_rows = if request_date == today {
            parse_mackolik_live_rows(&today_live_bundle.e)
        } else {
            request_bundle
                .map(|bundle| parse_mackolik_live_rows(&bundle.e))
                .unwrap_or_default()
        };
        let listed_rows = request_bundle
            .map(|bundle| parse_mackolik_listed_matches(&bundle.m, &request_date))
            .unwrap_or_default();
        let matched_live = live_rows
            .iter()
            .find(|item| tracked_match_matches_live(item, &request));
        let matched_listed = listed_rows
            .iter()
            .find(|item| tracked_match_matches_listed(item, &request));
        let mut status = if let Some(live_row) = matched_live {
            build_tracked_status_from_live_row(
                live_row,
                matched_listed,
                "Canlı skor akışı güncellendi.",
                Some(&request.id),
            )
        } else if let Some(listed) = matched_listed {
            build_tracked_status_from_listed_match(listed, &request)
        } else {
            TrackedMatchStatus {
                id: request.id.clone(),
                found: false,
                source: "mackolik".to_string(),
                state: "missing".to_string(),
                status_label: "Bulunamadı".to_string(),
                home_goals: None,
                away_goals: None,
                halftime_score: None,
                home_team_id: None,
                away_team_id: None,
                home_logo_url: None,
                away_logo_url: None,
                mackolik_match_page_id: request.mackolik_match_page_id,
                matchcast_id: request.matchcast_id,
                timeline_events: vec![TrackedTimelineEvent {
                    minute: request
                        .match_time
                        .clone()
                        .filter(|value| !value.trim().is_empty())
                        .unwrap_or_else(|| "-".to_string()),
                    minute_value: 0,
                    event_type: "update".to_string(),
                    side: "neutral".to_string(),
                    label: "Kaynak bekleniyor".to_string(),
                    note:
                        "Canlı akışta eşleşen kayıt bulunamadı. Son bilinen maç bilgisi korunuyor."
                            .to_string(),
                    score: None,
                }],
                note: "Maçkolik akışında eşleşen maç kaydı bulunamadı.".to_string(),
            }
        };
        let match_page_id = status
            .mackolik_match_page_id
            .or(request.mackolik_match_page_id)
            .filter(|value| *value > 0);
        if should_enrich_with_mackolik_detail(&status) {
            if let (Some(client), Some(match_page_id)) = (detail_client.as_ref(), match_page_id) {
                if let Ok(detail) =
                    fetch_mackolik_match_detail(client, match_page_id, &status.state)
                {
                    status = merge_match_detail_into_tracked_status(status, detail);
                }
            }
        }
        results.push(status);
    }
    Ok(results)
}

pub fn resolve_mackolik_matchcast_url(
    match_page_id: u64,
    matchcast_id: u64,
    home_team: &str,
    away_team: &str,
    width: Option<u16>,
) -> Result<String, String> {
    let client = build_http_client()?;
    let mut headers = HeaderMap::new();
    headers.insert(
        REFERER,
        HeaderValue::from_str(&format!("https://arsiv.mackolik.com/Mac/{match_page_id}"))
            .map_err(|_| "Mackolik referer başlığı kurulamadı.".to_string())?,
    );
    headers.insert(
        ORIGIN,
        HeaderValue::from_static("https://arsiv.mackolik.com"),
    );
    headers.insert(ACCEPT, HeaderValue::from_static("*/*"));
    let token_url = format!("https://visualisation.performgroup.com/getToken?rbid={matchcast_id}&customerId=mackolikWeb");
    let token = fetch_text_with_headers(&client, &token_url, Some(&headers))?
        .trim()
        .trim_matches('"')
        .to_string();
    if token.is_empty() || token.starts_with("<?xml") {
        return Err("Mackolik matchcast token alınamadı.".to_string());
    }
    let mut parsed = Url::parse("https://visualisation.performgroup.com/csb/index.html")
        .map_err(|_| "Matchcast bağlantısı oluşturulamadı.".to_string())?;
    parsed
        .query_pairs_mut()
        .append_pair("token", &token)
        .append_pair("homeTeam", home_team.trim())
        .append_pair("awayTeam", away_team.trim())
        .append_pair("matchId", &matchcast_id.to_string())
        .append_pair("width", &width.unwrap_or(640).to_string())
        .append_pair("lang", "tr")
        .append_pair("gacode", "UA-241588-3")
        .append_pair("wbeventid", "0")
        .append_pair(
            "cssdiff",
            "https://arsiv.mackolik.com/matchcast/css_diff.css",
        );
    Ok(parsed.to_string())
}

pub fn open_external_url(url: &str) -> Result<(), String> {
    let parsed = Url::parse(url).map_err(|_| "Geçersiz bağlantı adresi.".to_string())?;
    let scheme = parsed.scheme().to_ascii_lowercase();
    if scheme != "http" && scheme != "https" {
        return Err("Yalnızca http/https bağlantıları açılabilir.".to_string());
    }
    #[cfg(target_os = "windows")]
    {
        Command::new("cmd")
            .args(["/C", "start", "", url])
            .spawn()
            .map_err(|error| format!("Bağlantı açılamadı: {error}"))?;
        return Ok(());
    }
    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg(url)
            .spawn()
            .map_err(|error| format!("Bağlantı açılamadı: {error}"))?;
        return Ok(());
    }
    #[cfg(all(unix, not(target_os = "macos")))]
    {
        Command::new("xdg-open")
            .arg(url)
            .spawn()
            .map_err(|error| format!("Bağlantı açılamadı: {error}"))?;
        return Ok(());
    }
    #[allow(unreachable_code)]
    Err("Bu işletim sisteminde dış bağlantı açma desteklenmiyor.".to_string())
}

fn today_iso_date() -> String {
    let now = SystemTime::now();
    let unix_seconds = now
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_secs() as i64)
        .unwrap_or(0);
    let offset_seconds = 3 * 60 * 60;
    format_unix_seconds_date_tr(unix_seconds + offset_seconds)
}

fn extract_program_sport_name(url: &str) -> Option<String> {
    let parsed = Url::parse(url).ok()?;
    let segments = parsed
        .path_segments()?
        .filter(|item| !item.is_empty())
        .collect::<Vec<_>>();
    if segments.first().copied()? != "program" {
        return None;
    }
    segments.get(1).map(|value| value.to_string())
}

fn extract_live_program_sport_name(url: &str) -> Option<String> {
    let parsed = Url::parse(url).ok()?;
    let segments = parsed
        .path_segments()?
        .filter(|item| !item.is_empty())
        .collect::<Vec<_>>();
    if segments.first().copied()? != "program"
        || normalize_team_phrase(segments.get(1).copied().unwrap_or_default()) != "canli"
    {
        return None;
    }
    segments.get(2).map(|value| value.to_string())
}

fn build_match_detail_url(sport_name: &str, sport_id: u32, event_id: u64) -> String {
    format!(
        "https://www.iddaa.com/program/{}/mac-detay/{}/{}/ozet",
        sport_name, sport_id, event_id
    )
}

fn passes_league_policy(
    league: &str,
    filters: &[String],
    whitelist: &[String],
    blacklist: &[String],
) -> bool {
    let normalized = normalize_team_phrase(league);
    if blacklist.iter().any(|item| normalized.contains(item)) {
        return false;
    }
    if !whitelist.is_empty() && !whitelist.iter().any(|item| normalized.contains(item)) {
        return false;
    }
    if !filters.is_empty() && !filters.iter().any(|item| normalized.contains(item)) {
        return false;
    }
    true
}

fn normalize_filter_terms(values: Option<Vec<String>>) -> Vec<String> {
    values
        .unwrap_or_default()
        .into_iter()
        .map(|value| normalize_team_phrase(&value))
        .filter(|value| !value.is_empty())
        .collect()
}

fn fetch_iddaa_program_events(client: &Client) -> Result<Vec<IddaaSportsbookEvent>, String> {
    let payload: IddaaSportsbookProgramResponse = fetch_json(
        client,
        "https://sportsbookv2.iddaa.com/sportsbook/events?st=1",
    )?;
    if !payload.is_success {
        return Err("iddaa program verisi alınamadı.".to_string());
    }
    Ok(payload.data.map(|value| value.events).unwrap_or_default())
}

fn fetch_iddaa_live_events(client: &Client) -> Result<Vec<IddaaSportsbookEvent>, String> {
    let payload: IddaaSportsbookLiveResponse = fetch_json(
        client,
        "https://sportsbookv2.iddaa.com/sportsbook/live-events-for-widget",
    )?;
    if !payload.is_success {
        return Err("iddaa canlı program verisi alınamadı.".to_string());
    }
    Ok(payload.data)
}

fn fetch_iddaa_competition_names(client: &Client) -> Result<HashMap<u64, String>, String> {
    let payload: IddaaSportsbookCompetitionsResponse = fetch_json(
        client,
        "https://sportsbookv2.iddaa.com/sportsbook/competitions?st=1",
    )?;
    if !payload.is_success {
        return Ok(HashMap::new());
    }
    let mut names = HashMap::new();
    for item in payload.data {
        let Some(id) = item.id else {
            continue;
        };
        let label = item
            .name
            .or(item.short_name)
            .map(|value| value.trim().to_string())
            .filter(|value| !value.is_empty());
        if let Some(label) = label {
            names.insert(id, label);
        }
    }
    Ok(names)
}

fn parse_iddaa_listed_matches(
    events: &[IddaaSportsbookEvent],
    competition_names: &HashMap<u64, String>,
    scan_date: &str,
    sport_id: u32,
) -> Vec<MackolikListedMatch> {
    events
        .iter()
        .filter_map(|event| {
            if event.sport_id.unwrap_or(1) != sport_id {
                return None;
            }
            let home_team = event.home_team.as_deref()?.trim();
            let away_team = event.away_team.as_deref()?.trim();
            if home_team.is_empty() || away_team.is_empty() {
                return None;
            }

            let (match_date, match_time) =
                iddaa_event_kickoff_date_time(event.kickoff_unix, scan_date);
            if match_date != scan_date {
                return None;
            }

            let league = event
                .competition_id
                .and_then(|competition_id| competition_names.get(&competition_id).cloned())
                .unwrap_or_else(|| "Lig".to_string());
            Some(MackolikListedMatch {
                match_page_id: event.event_id,
                event_id: Some(event.event_id),
                sport_id,
                home_team_id: None,
                away_team_id: None,
                home_team: home_team.to_string(),
                away_team: away_team.to_string(),
                home_goals: iddaa_score_to_u8(
                    event.score.as_ref().and_then(|score| score.home.as_ref()),
                ),
                away_goals: iddaa_score_to_u8(
                    event.score.as_ref().and_then(|score| score.away.as_ref()),
                ),
                match_date,
                match_time,
                match_status: iddaa_listed_status_label(event),
                league,
            })
        })
        .collect()
}

fn parse_iddaa_live_rows(
    events: &[IddaaSportsbookEvent],
    competition_names: &HashMap<u64, String>,
    sport_id: u32,
) -> Vec<MackolikLiveRow> {
    dedupe_mackolik_live_rows(
        events
            .iter()
            .filter_map(|event| {
                if event.sport_id.unwrap_or(1) != sport_id {
                    return None;
                }
                if event.status_code.unwrap_or(0) != 1 {
                    return None;
                }
                let home_team = event.home_team.as_deref()?.trim();
                let away_team = event.away_team.as_deref()?.trim();
                if home_team.is_empty() || away_team.is_empty() {
                    return None;
                }
                let league = event
                    .competition_id
                    .and_then(|competition_id| competition_names.get(&competition_id).cloned())
                    .unwrap_or_else(|| "Lig".to_string());
                Some(MackolikLiveRow {
                    match_page_id: event.event_id,
                    league,
                    home_team_id: None,
                    away_team_id: None,
                    home_team: home_team.to_string(),
                    away_team: away_team.to_string(),
                    home_goals: iddaa_score_to_u8(
                        event.score.as_ref().and_then(|score| score.home.as_ref()),
                    )
                    .unwrap_or(0),
                    away_goals: iddaa_score_to_u8(
                        event.score.as_ref().and_then(|score| score.away.as_ref()),
                    )
                    .unwrap_or(0),
                    minute_label: iddaa_live_minute_label(event),
                })
            })
            .collect(),
    )
}

fn iddaa_score_to_u8(side: Option<&IddaaSportsbookScoreSide>) -> Option<u8> {
    side.and_then(|item| item.score)
        .and_then(|value| u8::try_from(value).ok())
}

fn iddaa_listed_status_label(event: &IddaaSportsbookEvent) -> String {
    match event.status_code.unwrap_or(0) {
        0 => String::new(),
        1 => iddaa_live_minute_label(event),
        2 | 3 => "MS".to_string(),
        _ => iddaa_live_minute_label(event),
    }
}

fn iddaa_live_minute_label(event: &IddaaSportsbookEvent) -> String {
    if let Some(score) = event.score.as_ref() {
        if let Some(minute) = score.minute {
            let extra_from_seconds = score.second.unwrap_or(0) / 60;
            let display_minute = minute.saturating_add(extra_from_seconds).min(130);
            if display_minute > 0 {
                return format!("{display_minute}'");
            }
        }
        if matches!(score.status_code, Some(4) | Some(5)) {
            return "İY".to_string();
        }
    }
    match event.status_code.unwrap_or(0) {
        0 => "Planlandı".to_string(),
        1 => "Canlı".to_string(),
        _ => "MS".to_string(),
    }
}

fn iddaa_event_kickoff_date_time(
    kickoff_unix: Option<i64>,
    fallback_date: &str,
) -> (String, String) {
    let Some(kickoff_unix) = kickoff_unix else {
        return (fallback_date.to_string(), "--:--".to_string());
    };
    let local_seconds = kickoff_unix.saturating_add(3 * 60 * 60);
    let match_date = format_unix_seconds_date_tr(local_seconds);
    let second_of_day = local_seconds.rem_euclid(86_400);
    let hour = second_of_day / 3_600;
    let minute = (second_of_day % 3_600) / 60;
    (match_date, format!("{hour:02}:{minute:02}"))
}

fn fetch_mackolik_live_bundle(date_iso: &str) -> Result<MackolikLiveBundle, String> {
    let client = build_http_client()?;
    let formatted = iso_to_mackolik_date(date_iso)?;
    fetch_json(
        &client,
        &format!("https://vd.mackolik.com/livedata?date={formatted}"),
    )
}

fn fetch_mackolik_live_now_bundle() -> Result<MackolikLiveBundle, String> {
    let client = build_http_client()?;
    fetch_json(&client, "https://vd.mackolik.com/livedata?group=0")
}

fn iso_to_mackolik_date(date_iso: &str) -> Result<String, String> {
    NaiveDate::parse_from_str(date_iso, "%Y-%m-%d")
        .map(|date| date.format("%d/%m/%Y").to_string())
        .map_err(|_| format!("Geçersiz tarih: {date_iso}"))
}

fn value_to_u64(value: &Value) -> Option<u64> {
    value
        .as_u64()
        .or_else(|| value.as_str()?.parse::<u64>().ok())
}

fn value_to_u8(value: &Value) -> Option<u8> {
    value
        .as_u64()
        .and_then(|number| u8::try_from(number).ok())
        .or_else(|| value.as_str()?.parse::<u8>().ok())
}

fn value_to_string(value: &Value) -> Option<String> {
    value
        .as_str()
        .map(|text| text.trim().to_string())
        .filter(|text| !text.is_empty())
}

fn parse_mackolik_listed_matches(
    rows: &[Vec<Value>],
    fallback_date: &str,
) -> Vec<MackolikListedMatch> {
    rows.iter()
        .filter_map(|row| {
            if row.len() < 38 {
                return None;
            }
            let match_page_id = value_to_u64(&row[0])?;
            let home_team = value_to_string(&row[2])?;
            let away_team = value_to_string(&row[4])?;
            let league_info = row[36].as_array().cloned().unwrap_or_default();
            let league = league_info
                .get(3)
                .and_then(value_to_string)
                .unwrap_or_else(|| "Lig".to_string());
            Some(MackolikListedMatch {
                match_page_id,
                event_id: value_to_u64(&row[14]),
                sport_id: value_to_u64(&row[37]).unwrap_or(1) as u32,
                home_team_id: value_to_u64(&row[1]),
                away_team_id: value_to_u64(&row[3]),
                home_team,
                away_team,
                home_goals: value_to_u8(&row[5]),
                away_goals: value_to_u8(&row[13]),
                match_date: value_to_string(&row[35]).unwrap_or_else(|| fallback_date.to_string()),
                match_time: value_to_string(&row[16]).unwrap_or_else(|| "--:--".to_string()),
                match_status: value_to_string(&row[6]).unwrap_or_default(),
                league,
            })
        })
        .collect()
}

fn listed_match_is_upcoming(item: &MackolikListedMatch) -> bool {
    let status = item.match_status.trim();
    if status.is_empty() {
        return true;
    }

    let normalized = normalize_team_phrase(status);
    if normalized.is_empty() {
        return true;
    }

    if normalized.contains("ms")
        || normalized.contains("uz")
        || normalized.contains("ert")
        || normalized.contains("ipt")
        || normalized.contains("canli")
        || normalized.contains("devre")
        || normalized.contains("pen")
        || normalized.contains("iy")
    {
        return false;
    }

    let has_apostrophe = status.contains('\'');
    let only_digits = normalized.chars().all(|ch| ch.is_ascii_digit());
    if has_apostrophe || only_digits {
        return false;
    }

    true
}

fn parse_mackolik_live_rows(rows: &[Vec<Value>]) -> Vec<MackolikLiveRow> {
    dedupe_mackolik_live_rows(
        rows.iter()
            .filter_map(|row| {
                if row.len() < 19 {
                    return None;
                }
                Some(MackolikLiveRow {
                    match_page_id: value_to_u64(&row[1])?,
                    league: value_to_string(&row[5]).unwrap_or_else(|| "Lig".to_string()),
                    home_team_id: value_to_u64(&row[7]),
                    away_team_id: value_to_u64(&row[9]),
                    home_team: value_to_string(&row[8])?,
                    away_team: value_to_string(&row[10])?,
                    home_goals: value_to_u8(&row[12]).unwrap_or(0),
                    away_goals: value_to_u8(&row[13]).unwrap_or(0),
                    minute_label: value_to_string(&row[18]).unwrap_or_else(|| "Canlı".to_string()),
                })
            })
            .collect(),
    )
}

fn has_status_token(normalized: &str, token: &str) -> bool {
    normalized.split_whitespace().any(|part| part == token)
}

fn status_indicates_finished(normalized: &str) -> bool {
    if normalized.is_empty() {
        return false;
    }
    if normalized.contains("yakinda")
        || normalized.contains("baslamadi")
        || normalized.contains("bekleniyor")
        || normalized.contains("planned")
        || normalized.contains("scheduled")
    {
        return false;
    }
    if normalized.contains("mac sonu")
        || normalized.contains("full time")
        || has_status_token(normalized, "ms")
        || has_status_token(normalized, "ft")
    {
        return true;
    }
    if normalized.contains("penalt") || has_status_token(normalized, "pen") {
        return true;
    }
    if normalized.contains("uzat") || has_status_token(normalized, "uz") {
        return true;
    }
    false
}

fn parse_mackolik_live_state(label: &str) -> String {
    let raw = label.trim();
    if raw.is_empty() {
        return "unknown".to_string();
    }

    let normalized = normalize_team_phrase(raw);
    if normalized.is_empty() {
        return "unknown".to_string();
    }

    if status_indicates_finished(&normalized) {
        return "finished".to_string();
    }

    if normalized.contains("iy")
        || normalized.contains("devre")
        || normalized.contains("yar")
        || normalized == "ht"
        || normalized.contains("half time")
    {
        return "halftime".to_string();
    }

    if normalized.contains("ert")
        || normalized.contains("ipt")
        || normalized.contains("tatil")
        || normalized.contains("ask")
        || normalized.contains("suspend")
        || normalized.contains("postpon")
        || normalized.contains("cancel")
    {
        return "suspended".to_string();
    }

    if normalized.contains("yakinda")
        || normalized.contains("baslamadi")
        || normalized.contains("bekleniyor")
        || normalized.contains("planned")
        || normalized.contains("scheduled")
    {
        return "scheduled".to_string();
    }

    if normalized.contains("canli") || normalized.contains("live") {
        return "live".to_string();
    }

    if parse_live_minute_value(raw) > 0 {
        return "live".to_string();
    }

    "unknown".to_string()
}

fn dedupe_mackolik_live_rows(rows: Vec<MackolikLiveRow>) -> Vec<MackolikLiveRow> {
    let mut best_by_match = HashMap::<u64, MackolikLiveRow>::new();
    let mut synthetic_keys = HashMap::<String, MackolikLiveRow>::new();

    for row in rows {
        if row.match_page_id > 0 {
            match best_by_match.get(&row.match_page_id) {
                Some(current) if !is_preferred_live_row(&row, current) => {}
                _ => {
                    best_by_match.insert(row.match_page_id, row);
                }
            }
            continue;
        }

        let key = format!(
            "{}|{}|{}",
            normalize_team_phrase(&row.league),
            normalize_team_phrase(&row.home_team),
            normalize_team_phrase(&row.away_team)
        );
        match synthetic_keys.get(&key) {
            Some(current) if !is_preferred_live_row(&row, current) => {}
            _ => {
                synthetic_keys.insert(key, row);
            }
        }
    }

    let mut merged = best_by_match.into_values().collect::<Vec<_>>();
    merged.extend(synthetic_keys.into_values());
    merged.sort_by(|left, right| compare_mackolik_live_rows(right, left));
    merged
}

fn compare_mackolik_live_rows(
    left: &MackolikLiveRow,
    right: &MackolikLiveRow,
) -> std::cmp::Ordering {
    let left_state = parse_mackolik_live_state(&left.minute_label);
    let right_state = parse_mackolik_live_state(&right.minute_label);
    let left_rank = mackolik_live_state_rank(&left_state);
    let right_rank = mackolik_live_state_rank(&right_state);

    left_rank
        .cmp(&right_rank)
        .then_with(|| {
            parse_live_minute_value(&left.minute_label)
                .cmp(&parse_live_minute_value(&right.minute_label))
        })
        .then_with(|| {
            (left.home_goals + left.away_goals).cmp(&(right.home_goals + right.away_goals))
        })
}

fn is_preferred_live_row(candidate: &MackolikLiveRow, current: &MackolikLiveRow) -> bool {
    compare_mackolik_live_rows(candidate, current).is_gt()
}

fn mackolik_live_state_rank(state: &str) -> u8 {
    match state {
        "live" => 5,
        "halftime" => 4,
        "scheduled" => 3,
        "suspended" => 2,
        "finished" => 1,
        "unknown" => 0,
        _ => 0,
    }
}

fn parse_live_minute_value(label: &str) -> u16 {
    let raw = label.trim();
    if raw.is_empty() {
        return 0;
    }

    let normalized = normalize_team_phrase(raw);
    if normalized.contains("iy") || normalized.contains("devre") || normalized == "ht" {
        return 45;
    }
    if status_indicates_finished(&normalized) {
        return 90;
    }

    let pattern = Regex::new(r"(\d{1,3})(?:\s*\+\s*(\d{1,2}))?").expect("valid live minute regex");
    if let Some(caps) = pattern.captures(raw) {
        let base = caps
            .get(1)
            .and_then(|value| value.as_str().parse::<u16>().ok())
            .unwrap_or(0);
        let extra = caps
            .get(2)
            .and_then(|value| value.as_str().parse::<u16>().ok())
            .unwrap_or(0);
        return base.saturating_add(extra).min(130);
    }

    0
}

fn is_flashscore_match_url(url: &str) -> bool {
    url.contains("flashscore.com") && url.contains("/mac/futbol/")
}

#[allow(dead_code)]
fn fetch_flashscore_match_links() -> Result<Vec<String>, String> {
    let client = build_http_client()?;
    let mut headers = HeaderMap::new();
    headers.insert(
        ACCEPT_LANGUAGE,
        HeaderValue::from_static("tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7"),
    );
    let html = fetch_text_with_headers(
        &client,
        "https://www.flashscore.com.tr/futbol/",
        Some(&headers),
    )?;
    let pattern = Regex::new(r#"/mac/futbol/[^"'\s<>]+"#).expect("valid flashscore link regex");
    let mut links = pattern
        .find_iter(&html)
        .map(|item| format!("https://www.flashscore.com.tr{}", item.as_str()))
        .collect::<Vec<_>>();
    links.sort();
    links.dedup();
    Ok(links)
}

#[allow(dead_code)]
fn resolve_flashscore_match_url(links: &[String], request: &TrackedMatchRequest) -> Option<String> {
    let home = normalize_team_phrase(&request.home_team);
    let away = normalize_team_phrase(&request.away_team);
    links
        .iter()
        .filter_map(|url| {
            let (link_home, link_away) = parse_flashscore_match_slug(url)?;
            let left = normalize_team_phrase(&link_home);
            let right = normalize_team_phrase(&link_away);
            let mut score = 0u8;
            if team_name_matches(&request.home_team, &link_home) {
                score += 2;
            } else if contains_whole_phrase(&left, &home) || contains_whole_phrase(&home, &left) {
                score += 1;
            }
            if team_name_matches(&request.away_team, &link_away) {
                score += 2;
            } else if contains_whole_phrase(&right, &away) || contains_whole_phrase(&away, &right) {
                score += 1;
            }
            if score >= 3 {
                Some((score, url.clone()))
            } else {
                None
            }
        })
        .max_by_key(|item| item.0)
        .map(|item| item.1)
}

#[allow(dead_code)]
fn parse_flashscore_match_slug(url: &str) -> Option<(String, String)> {
    let parsed = Url::parse(url).ok()?;
    let segments = parsed
        .path_segments()?
        .filter(|item| !item.is_empty())
        .collect::<Vec<_>>();
    if segments.len() < 4 || segments[0] != "mac" || segments[1] != "futbol" {
        return None;
    }
    let home = normalize_flashscore_slug(segments[2]);
    let away = normalize_flashscore_slug(segments[3]);
    if home.is_empty() || away.is_empty() {
        return None;
    }
    Some((home, away))
}

#[allow(dead_code)]
fn normalize_flashscore_slug(value: &str) -> String {
    value
        .rsplit_once('-')
        .map(|item| item.0)
        .unwrap_or(value)
        .replace('-', " ")
        .trim()
        .to_string()
}

fn extract_flashscore_environment(html: &str) -> Result<Value, String> {
    let pattern = Regex::new(r#"window\.environment\s*=\s*(\{.*?\});\s*</script>"#)
        .expect("valid flashscore environment regex");
    let raw = pattern
        .captures(html)
        .and_then(|caps| caps.get(1))
        .map(|item| item.as_str())
        .ok_or_else(|| "Flashscore sayfasında environment verisi bulunamadı.".to_string())?;
    serde_json::from_str::<Value>(raw)
        .map_err(|error| format!("Flashscore environment çözümlenemedi: {error}"))
}

fn flatten_flashscore_common_feed(value: &Value) -> HashMap<String, Value> {
    let mut map = HashMap::new();
    value
        .as_array()
        .into_iter()
        .flatten()
        .filter_map(|item| item.as_object())
        .for_each(|object| {
            object.iter().for_each(|(key, value)| {
                map.insert(key.to_string(), value.clone());
            });
        });
    map
}

fn parse_flashscore_status(environment: &Value) -> (String, String, Option<u16>, Option<String>) {
    let stage_id = environment
        .get("eventStageId")
        .and_then(|value| {
            value
                .as_i64()
                .or_else(|| value.as_str().and_then(|item| item.parse::<i64>().ok()))
        })
        .unwrap_or(45);
    let stage_time = environment
        .get("event_stage_time")
        .and_then(|value| value.as_str())
        .unwrap_or("")
        .trim()
        .to_string();
    let translation = environment
        .get("eventStageTranslations")
        .and_then(|value| value.get(stage_id.to_string()))
        .and_then(|value| value.as_str())
        .unwrap_or("Bekleniyor")
        .trim()
        .to_string();
    let minute_value = stage_time
        .split(':')
        .next()
        .and_then(|value| value.parse::<u16>().ok())
        .filter(|value| *value > 0);
    let halftime_score = environment
        .get("event_info")
        .and_then(|value| value.get("ht"))
        .and_then(|value| value.as_str())
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty());

    let state = match stage_id {
        3 | 9 | 10 | 11 | 54 => "finished",
        38 => "halftime",
        2 | 6 | 7 | 12 | 13 | 42 | 46 => "live",
        43 | 4 | 5 | 36 | 37 => "missing",
        _ => "scheduled",
    }
    .to_string();

    let status_label = match state.as_str() {
        "finished" => "MS".to_string(),
        "halftime" => "İY".to_string(),
        "live" => minute_value
            .map(|minute| format!("{}'", minute.min(120)))
            .unwrap_or_else(|| translation.clone()),
        _ => translation.clone(),
    };

    (state, status_label, minute_value, halftime_score)
}

fn parse_flashscore_score(environment: &Value, html: &str) -> (Option<u8>, Option<u8>) {
    let common_feed =
        flatten_flashscore_common_feed(environment.get("common_feed").unwrap_or(&Value::Null));
    let home = common_feed
        .get("DE")
        .and_then(value_to_u8)
        .or_else(|| common_feed.get("DG").and_then(value_to_u8));
    let away = common_feed
        .get("DF")
        .and_then(value_to_u8)
        .or_else(|| common_feed.get("DH").and_then(value_to_u8));
    if home.is_some() && away.is_some() {
        return (home, away);
    }

    let meta_pattern = Regex::new(r#"<meta property=\"og:title\" content=\"[^\"]+ (\d+):(\d+)\""#)
        .expect("valid flashscore og title regex");
    if let Some(caps) = meta_pattern.captures(html) {
        return (
            caps.get(1)
                .and_then(|value| value.as_str().parse::<u8>().ok()),
            caps.get(2)
                .and_then(|value| value.as_str().parse::<u8>().ok()),
        );
    }

    (home, away)
}

fn parse_score_pair_from_text(value: &str) -> Option<(u8, u8)> {
    let pattern = Regex::new(r"(?iu)(\d{1,2})\s*[-:]\s*(\d{1,2})").expect("valid score regex");
    let captures = pattern.captures(value)?;
    let home = captures.get(1)?.as_str().parse::<u8>().ok()?;
    let away = captures.get(2)?.as_str().parse::<u8>().ok()?;
    Some((home, away))
}

fn normalize_score_line(value: &str) -> Option<String> {
    parse_score_pair_from_text(value).map(|(home, away)| format!("{home}-{away}"))
}

fn should_enrich_with_mackolik_detail(status: &TrackedMatchStatus) -> bool {
    let normalized_state = status.state.trim().to_ascii_lowercase();
    if matches!(normalized_state.as_str(), "live" | "halftime" | "finished") {
        return true;
    }
    matches!(normalized_state.as_str(), "unknown" | "missing")
        && status.home_goals.is_some()
        && status.away_goals.is_some()
}

fn fetch_mackolik_match_detail(
    client: &Client,
    match_page_id: u64,
    state_hint: &str,
) -> Result<MackolikMatchDetail, String> {
    let url = format!(
        "https://arsiv.mackolik.com/Match/MatchData.aspx?t=dtl&id={}&s=0",
        match_page_id
    );
    let payload: Value = fetch_json(client, &url)?;
    let detail = payload
        .as_object()
        .ok_or_else(|| "Mackolik maç detay verisi çözümlenemedi.".to_string())?;
    let summary = detail
        .get("d")
        .and_then(Value::as_object)
        .cloned()
        .unwrap_or_default();

    let status_text = summary
        .get("st")
        .and_then(Value::as_str)
        .unwrap_or_default()
        .trim()
        .to_string();
    let score_text = summary
        .get("s")
        .and_then(Value::as_str)
        .and_then(normalize_score_line);
    let halftime_score = summary
        .get("ht")
        .and_then(Value::as_str)
        .and_then(normalize_score_line);
    let fulltime_score = summary
        .get("ft")
        .and_then(Value::as_str)
        .and_then(normalize_score_line)
        .or_else(|| {
            let normalized = normalize_team_phrase(&status_text);
            if status_indicates_finished(&normalized) {
                score_text.clone()
            } else {
                None
            }
        });
    let penalties_score = summary
        .get("pt")
        .and_then(Value::as_str)
        .and_then(normalize_score_line);
    let detail_state = if fulltime_score.is_some() {
        "finished"
    } else if matches!(state_hint, "live" | "halftime" | "finished") {
        state_hint
    } else {
        "live"
    };

    let raw_events = detail
        .get("e")
        .and_then(Value::as_array)
        .cloned()
        .unwrap_or_default();
    let timeline_events = build_mackolik_detail_timeline_events(
        &raw_events,
        halftime_score.as_deref(),
        fulltime_score.as_deref().or(score_text.as_deref()),
        detail_state,
    );

    Ok(MackolikMatchDetail {
        status_text,
        score_text,
        halftime_score,
        fulltime_score,
        penalties_score,
        timeline_events,
    })
}

fn merge_match_detail_into_tracked_status(
    mut status: TrackedMatchStatus,
    detail: MackolikMatchDetail,
) -> TrackedMatchStatus {
    if !detail.timeline_events.is_empty() {
        status.timeline_events = detail.timeline_events;
    }

    if status
        .halftime_score
        .as_deref()
        .map(|value| value.trim().is_empty())
        .unwrap_or(true)
    {
        if let Some(halftime) = detail.halftime_score.clone() {
            status.halftime_score = Some(halftime);
        }
    }

    if let Some((home, away)) = detail
        .fulltime_score
        .as_deref()
        .or(detail.score_text.as_deref())
        .and_then(parse_score_pair_from_text)
    {
        if status.home_goals.is_none() || status.away_goals.is_none() {
            status.home_goals = Some(home);
            status.away_goals = Some(away);
        }
    }

    let mut note_parts = Vec::new();
    if !status.note.trim().is_empty() {
        note_parts.push(status.note.trim().to_string());
    }
    if let Some(penalties) = detail
        .penalties_score
        .as_deref()
        .filter(|value| !value.trim().is_empty())
    {
        note_parts.push(format!("Penaltılar {penalties}"));
    }
    if !detail.status_text.trim().is_empty() && status.state != "finished" {
        note_parts.push(format!("Detay durum: {}", detail.status_text.trim()));
    }
    if !note_parts.is_empty() {
        status.note = note_parts.join(" • ");
    }

    status
}

fn build_mackolik_detail_timeline_events(
    events: &[Value],
    halftime_score: Option<&str>,
    final_score: Option<&str>,
    state: &str,
) -> Vec<TrackedTimelineEvent> {
    let mut running_home = 0u8;
    let mut running_away = 0u8;
    let mut timeline = Vec::new();

    for row in events.iter().filter_map(Value::as_array) {
        if let Some(seed) =
            parse_mackolik_detail_event_seed(row, &mut running_home, &mut running_away)
        {
            timeline.push(TrackedTimelineEvent {
                minute_value: seed.minute_value,
                minute: seed.minute,
                event_type: seed.event_type,
                side: seed.side,
                label: seed.label,
                note: seed.note,
                score: seed.score,
            });
        }
    }

    if let Some(half) = halftime_score.filter(|value| !value.trim().is_empty()) {
        if !timeline.iter().any(|item| item.event_type == "halftime") {
            timeline.push(TrackedTimelineEvent {
                minute: "45+".to_string(),
                minute_value: 45,
                event_type: "halftime".to_string(),
                side: "neutral".to_string(),
                label: "İlk yarı".to_string(),
                note: format!("İlk yarı {half} skoruyla kapandı."),
                score: Some(half.to_string()),
            });
        }
    }

    if state == "finished" {
        if let Some(final_line) = final_score.filter(|value| !value.trim().is_empty()) {
            if !timeline.iter().any(|item| item.event_type == "fulltime") {
                timeline.push(TrackedTimelineEvent {
                    minute: "90+".to_string(),
                    minute_value: 90,
                    event_type: "fulltime".to_string(),
                    side: "neutral".to_string(),
                    label: "Maç sonu".to_string(),
                    note: format!("Maç {final_line} skoruyla tamamlandı."),
                    score: Some(final_line.to_string()),
                });
            }
        }
    }

    timeline.sort_by(|left, right| {
        left.minute_value
            .cmp(&right.minute_value)
            .then_with(|| left.event_type.cmp(&right.event_type))
    });
    timeline
}

fn mackolik_detail_event_text(row: &[Value], extra: &Value) -> String {
    let mut parts = Vec::<String>::new();
    if let Some(text) = row.get(2).and_then(Value::as_str) {
        let clean = text.trim();
        if !clean.is_empty() {
            parts.push(clean.to_string());
        }
    }
    if let Some(text) = extra.get("t").and_then(Value::as_str) {
        let clean = text.trim();
        if !clean.is_empty() {
            parts.push(clean.to_string());
        }
    }
    if let Some(text) = extra.get("note").and_then(Value::as_str) {
        let clean = text.trim();
        if !clean.is_empty() {
            parts.push(clean.to_string());
        }
    }
    if let Some(text) = extra.get("n").and_then(Value::as_str) {
        let clean = text.trim();
        if !clean.is_empty() {
            parts.push(clean.to_string());
        }
    }
    parts.join(" ")
}

fn classify_mackolik_detail_event(text: &str) -> Option<(&'static str, &'static str)> {
    let normalized = normalize_team_phrase(text);
    if normalized.is_empty() {
        return None;
    }
    if normalized.contains("korner") || normalized.contains("corner") {
        return Some(("corner", "Korner"));
    }
    if normalized.contains("penalt") {
        return Some(("penalty", "Penaltı"));
    }
    if normalized.contains("sari kart") || normalized.contains("yellow") {
        return Some(("yellow", "Sarı kart"));
    }
    if normalized.contains("kirmizi kart") || normalized.contains("red card") {
        return Some(("red", "Kırmızı kart"));
    }
    if normalized.contains("degis") || normalized.contains("substit") {
        return Some(("sub", "Oyuncu değişikliği"));
    }
    if normalized.contains("gol") {
        return Some(("goal", "Gol"));
    }
    None
}

fn parse_mackolik_detail_event_seed(
    row: &[Value],
    running_home: &mut u8,
    running_away: &mut u8,
) -> Option<MackolikTimelineSeed> {
    if row.len() < 5 {
        return None;
    }

    let mut side = match row.get(0).and_then(value_to_u8).unwrap_or(0) {
        1 => "home".to_string(),
        2 => "away".to_string(),
        _ => "neutral".to_string(),
    };
    let minute_value = row
        .get(1)
        .and_then(value_to_u64)
        .and_then(|value| u16::try_from(value).ok())
        .unwrap_or(0)
        .min(120);
    let minute = if minute_value > 0 {
        format!("{}'", minute_value)
    } else {
        "-".to_string()
    };
    let player_name = row
        .get(3)
        .and_then(Value::as_str)
        .map(str::trim)
        .unwrap_or("");
    let actor = if player_name.is_empty() {
        "Bir oyuncu"
    } else {
        player_name
    };
    let event_code = row.get(4).and_then(value_to_u8).unwrap_or(0);
    let extra = row.get(5).unwrap_or(&Value::Null);
    let extra_flag = extra.get("d").and_then(value_to_u8);
    let assist_name = extra
        .get("astName")
        .and_then(Value::as_str)
        .map(str::trim)
        .unwrap_or("");
    let sub_out_name = extra
        .get("sub")
        .and_then(Value::as_str)
        .map(str::trim)
        .unwrap_or("");
    let raw_text = mackolik_detail_event_text(row, extra);
    let running_score = |home: u8, away: u8| Some(format!("{}-{}", home, away));

    match event_code {
        1 => {
            let own_goal = extra_flag == Some(3);
            let penalty_goal = extra_flag == Some(2);
            if own_goal {
                if side == "home" {
                    *running_away = running_away.saturating_add(1);
                    side = "away".to_string();
                } else if side == "away" {
                    *running_home = running_home.saturating_add(1);
                    side = "home".to_string();
                }
            } else if side == "home" {
                *running_home = running_home.saturating_add(1);
            } else if side == "away" {
                *running_away = running_away.saturating_add(1);
            }
            let mut note = if own_goal {
                format!("{actor} kendi kalesine gol attı.")
            } else if penalty_goal {
                format!("{actor} penaltıdan gol attı.")
            } else {
                format!("{actor} gol attı.")
            };
            if !assist_name.is_empty() && !own_goal {
                note.push_str(&format!(" Asist: {assist_name}."));
            }
            Some(MackolikTimelineSeed {
                minute_value,
                minute,
                event_type: "goal".to_string(),
                side,
                label: if own_goal {
                    "Kendi kalesine gol".to_string()
                } else if penalty_goal {
                    "Penaltı golü".to_string()
                } else {
                    "Gol".to_string()
                },
                note,
                score: running_score(*running_home, *running_away),
            })
        }
        2 => Some(MackolikTimelineSeed {
            minute_value,
            minute,
            event_type: "yellow".to_string(),
            side,
            label: "Sarı kart".to_string(),
            note: format!("{actor} sarı kart gördü."),
            score: running_score(*running_home, *running_away),
        }),
        3 => {
            let second_yellow = extra_flag == Some(1);
            Some(MackolikTimelineSeed {
                minute_value,
                minute,
                event_type: "red".to_string(),
                side,
                label: if second_yellow {
                    "Çift sarıdan kırmızı".to_string()
                } else {
                    "Kırmızı kart".to_string()
                },
                note: if second_yellow {
                    format!("{actor} ikinci sarıdan oyundan atıldı.")
                } else {
                    format!("{actor} kırmızı kart gördü.")
                },
                score: running_score(*running_home, *running_away),
            })
        }
        4 | 5 => Some(MackolikTimelineSeed {
            minute_value,
            minute,
            event_type: "sub".to_string(),
            side,
            label: "Oyuncu değişikliği".to_string(),
            note: if sub_out_name.is_empty() {
                format!("{actor} oyuna girdi.")
            } else {
                format!("{actor} oyuna girdi, {sub_out_name} çıktı.")
            },
            score: running_score(*running_home, *running_away),
        }),
        7 => Some(MackolikTimelineSeed {
            minute_value,
            minute,
            event_type: "penalty".to_string(),
            side,
            label: "Kaçan penaltı".to_string(),
            note: format!("{actor} penaltıyı gole çeviremedi."),
            score: running_score(*running_home, *running_away),
        }),
        _ => {
            let (event_type, label) = classify_mackolik_detail_event(&raw_text)?;
            Some(MackolikTimelineSeed {
                minute_value,
                minute,
                event_type: event_type.to_string(),
                side,
                label: label.to_string(),
                note: if !raw_text.trim().is_empty() {
                    raw_text.trim().to_string()
                } else {
                    format!("{label} olayı işlendi.")
                },
                score: running_score(*running_home, *running_away),
            })
        }
    }
}

fn build_flashscore_timeline_events(
    state: &str,
    status_label: &str,
    home_goals: Option<u8>,
    away_goals: Option<u8>,
    halftime_score: Option<String>,
) -> Vec<TrackedTimelineEvent> {
    let score = tracked_score_text(home_goals, away_goals);
    let minute_value = parse_live_minute_value(status_label).min(120);
    let mut events = Vec::new();

    match state {
        "finished" => {
            events.push(TrackedTimelineEvent {
                minute: "90+".to_string(),
                minute_value: 90,
                event_type: "fulltime".to_string(),
                side: "neutral".to_string(),
                label: "Maç sonu".to_string(),
                note: format!(
                    "Final skor {} olarak işlendi.",
                    score.clone().unwrap_or_else(|| "-".to_string())
                ),
                score: score.clone(),
            });
        }
        "halftime" => {
            events.push(TrackedTimelineEvent {
                minute: "45+".to_string(),
                minute_value: 45,
                event_type: "halftime".to_string(),
                side: "neutral".to_string(),
                label: "İlk yarı".to_string(),
                note: format!(
                    "İlk yarı skoru {}.",
                    halftime_score
                        .clone()
                        .or_else(|| score.clone())
                        .unwrap_or_else(|| "-".to_string())
                ),
                score: halftime_score.clone().or_else(|| score.clone()),
            });
        }
        "live" => {
            events.push(TrackedTimelineEvent {
                minute: if minute_value > 0 {
                    format!("{}'", minute_value)
                } else {
                    status_label.to_string()
                },
                minute_value,
                event_type: "update".to_string(),
                side: "neutral".to_string(),
                label: "Canlı güncelleme".to_string(),
                note: format!(
                    "Canlı skor {} olarak işlendi.",
                    score.clone().unwrap_or_else(|| "-".to_string())
                ),
                score: score.clone(),
            });
        }
        _ => {
            events.push(TrackedTimelineEvent {
                minute: status_label.to_string(),
                minute_value: 0,
                event_type: "update".to_string(),
                side: "neutral".to_string(),
                label: "Durum".to_string(),
                note: "Maç durumu güncellendi.".to_string(),
                score: score.clone(),
            });
        }
    }

    if state == "finished" || state == "halftime" || state == "live" {
        events.push(TrackedTimelineEvent {
            minute: if state == "finished" {
                "90+".to_string()
            } else if minute_value > 0 {
                format!("{}'", minute_value)
            } else {
                status_label.to_string()
            },
            minute_value,
            event_type: "update".to_string(),
            side: "neutral".to_string(),
            label: "Son durum".to_string(),
            note: "Flashscore akışından skor güncellendi.".to_string(),
            score,
        });
    }

    events
}

fn fetch_flashscore_match_status(
    url: &str,
    request: &TrackedMatchRequest,
) -> Result<TrackedMatchStatus, String> {
    let client = build_http_client()?;
    let mut headers = HeaderMap::new();
    headers.insert(
        ACCEPT_LANGUAGE,
        HeaderValue::from_static("tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7"),
    );
    let html = fetch_text_with_headers(&client, url, Some(&headers))?;
    let environment = extract_flashscore_environment(&html)?;
    let (state, status_label, _minute_value, halftime_score) =
        parse_flashscore_status(&environment);
    let (home_goals, away_goals) = parse_flashscore_score(&environment, &html);
    let participants = environment.get("participantsData").unwrap_or(&Value::Null);
    let home_participant = participants
        .get("home")
        .and_then(|value| value.as_array())
        .and_then(|items| items.first());
    let away_participant = participants
        .get("away")
        .and_then(|value| value.as_array())
        .and_then(|items| items.first());
    let home_logo_url = home_participant
        .and_then(|item| {
            item.get("small_image_path")
                .or_else(|| item.get("image_path"))
        })
        .and_then(|value| value.as_str())
        .map(|value| value.to_string());
    let away_logo_url = away_participant
        .and_then(|item| {
            item.get("small_image_path")
                .or_else(|| item.get("image_path"))
        })
        .and_then(|value| value.as_str())
        .map(|value| value.to_string());

    Ok(TrackedMatchStatus {
        id: request.id.clone(),
        found: true,
        source: "flashscore".to_string(),
        state: state.clone(),
        status_label: status_label.clone(),
        home_goals,
        away_goals,
        halftime_score: halftime_score.clone(),
        home_team_id: None,
        away_team_id: None,
        home_logo_url,
        away_logo_url,
        mackolik_match_page_id: request.mackolik_match_page_id,
        matchcast_id: request.matchcast_id,
        timeline_events: build_flashscore_timeline_events(
            &state,
            &status_label,
            home_goals,
            away_goals,
            halftime_score,
        ),
        note: "Flashscore akışından skor güncellendi.".to_string(),
    })
}
fn build_fallback_analysis(
    live_row: &MackolikLiveRow,
    matched: Option<&MackolikListedMatch>,
    detail_url: &str,
) -> AnalysisResponse {
    let league = matched
        .map(|item| item.league.clone())
        .unwrap_or_else(|| live_row.league.clone());
    let match_time = matched
        .map(|item| item.match_time.clone())
        .unwrap_or_default();
    let match_date = matched
        .map(|item| item.match_date.clone())
        .unwrap_or_else(today_iso_date);
    let home_team_name = matched
        .map(|item| item.home_team.clone())
        .filter(|name| !name.trim().is_empty())
        .unwrap_or_else(|| live_row.home_team.clone());
    let away_team_name = matched
        .map(|item| item.away_team.clone())
        .filter(|name| !name.trim().is_empty())
        .unwrap_or_else(|| live_row.away_team.clone());
    let total_goals = live_row.home_goals as f64 + live_row.away_goals as f64;
    let confidence = (60 + total_goals as u8 * 4).min(87);
    let over25 = if total_goals >= 3.0 { 92 } else { 58 };
    let over35 = if total_goals >= 4.0 { 84 } else { 46 };
    let home_edge = if live_row.home_goals > live_row.away_goals {
        58
    } else {
        28
    };
    let away_edge = if live_row.away_goals > live_row.home_goals {
        58
    } else {
        28
    };
    let draw = if live_row.home_goals == live_row.away_goals {
        34
    } else {
        18
    };
    let recommendations = vec![Recommendation {
        market: if live_row.home_goals == live_row.away_goals {
            "Beraberlik".to_string()
        } else if live_row.home_goals > live_row.away_goals {
            format!("{} yenilmez", home_team_name)
        } else {
            format!("{} yenilmez", away_team_name)
        },
        probability: confidence,
        reason: "Canlı skor ve oyun durumu baz alınarak hızlı karar üretildi.".to_string(),
        risk_label: "Dengeli".to_string(),
        risk_class: "medium".to_string(),
    }];
    AnalysisResponse {
        demo_mode: detail_url.is_empty(),
        analysis_id: format!(
            "live-{}-{}",
            normalize_team_name(&live_row.home_team),
            normalize_team_name(&live_row.away_team)
        ),
        sharp_mode: false,
        source_label: if detail_url.is_empty() {
            "Canlı hızlı analiz".to_string()
        } else {
            "Canlı + detay eşleşmesi".to_string()
        },
        source_status: SourceStatus {
            mode: "live".to_string(),
            label: "Canlı veri".to_string(),
            detail: "Canlı durumdan hızlı okuma yapıldı.".to_string(),
            health: "ok".to_string(),
            fallback_used: detail_url.is_empty(),
        },
        confidence_score: confidence,
        confidence_factors: vec![ConfidenceFactor {
            label: "Skor durumu".to_string(),
            score: confidence,
            detail: format!(
                "{} ve skor {}-{} canlı kararın ana omurgasını kuruyor.",
                live_row.minute_label, live_row.home_goals, live_row.away_goals
            ),
        }],
        league_profile: LeagueProfile {
            title: format!("{} profili", league),
            style: "Canlı oyun".to_string(),
            summary: "Canlı ritim üzerinden hızlı pazar okuması üretildi.".to_string(),
            bias_market: if total_goals >= 3.0 {
                "Üst pazarı".to_string()
            } else {
                "Taraf pazarı".to_string()
            },
            caution: "Canlı veri akışı değişkendir; son bölümde tempo ani kırılabilir.".to_string(),
        },
        detail_engine_summary: "Canlı hızlı analiz hazır.".to_string(),
        detail_modules: vec![DetailModule {
            label: "Canlı skor".to_string(),
            score: confidence,
            summary: format!(
                "Skor {}-{} ve dakika {} birlikte okundu.",
                live_row.home_goals, live_row.away_goals, live_row.minute_label
            ),
            tone: "primary".to_string(),
        }],
        odds_movement: None::<OddsMovement>,
        hard_filter: HardFilter {
            allow: true,
            title: "Canlı filtre".to_string(),
            reason: "Temel canlı veri bulundu.".to_string(),
            severity: "info".to_string(),
        },
        market_specialists: Vec::new(),
        ai_layer_used: false,
        ai_model_label: "Yerel".to_string(),
        ai_status_message: "AI katmanı kullanılmadı.".to_string(),
        ai_summary_cards: Vec::<AiSummaryCard>::new(),
        match_info: MatchInfo {
            home_team: live_row.home_team.clone(),
            away_team: live_row.away_team.clone(),
            league,
            match_date,
            match_time,
            location_type: "Canlı maç".to_string(),
        },
        probabilities: Probabilities {
            home_win: home_edge,
            draw,
            away_win: away_edge,
            btts_yes: if live_row.home_goals > 0 && live_row.away_goals > 0 {
                86
            } else {
                44
            },
            btts_no: if live_row.home_goals == 0 || live_row.away_goals == 0 {
                56
            } else {
                14
            },
        },
        markets: MarketBlock {
            over25,
            over25_note: if over25 >= 60 {
                "Üst tarafı canlı akışta sıcak.".to_string()
            } else {
                "Üst hattı sınırlı kaldı.".to_string()
            },
            over35,
            over35_note: if over35 >= 60 {
                "3.5 üst hattı hâlâ açık.".to_string()
            } else {
                "3.5 üst için ekstra gol gerekiyor.".to_string()
            },
            projected_goals: format!("{:.2} gol", total_goals.max(2.0)),
        },
        market_insights: Vec::<MarketInsight>::new(),
        recommendations,
        ai_narrative: "Canlı yorum hazırlanmadı.".to_string(),
        analyst_verdict: "Canlı hızlı analiz hazır.".to_string(),
        tactical_summary: "Skor ve dakika birlikte okundu.".to_string(),
        risk_summary: "Tempo düşerse canlı yön tersine dönebilir.".to_string(),
        verdict_steps: Vec::<VerdictStep>::new(),
        knockout_tie: None,
        form_summary: "Canlı akışta form yerine skor etkisi öne alındı.".to_string(),
        h2h_summary: "Canlı hızlı analizde H2H katmanı ikinci planda tutuldu.".to_string(),
        standings_summary: "Canlı hızlı analizde puan tablosu kullanılmadı.".to_string(),
        recent_matches: Vec::new(),
        h2h_matches: Vec::new(),
        league_standings: Vec::<LeagueStandingRow>::new(),
        decision_factors: Vec::<DecisionFactor>::new(),
        analysis_pillars: Vec::<AnalysisPillar>::new(),
        scenario_cards: Vec::<ScenarioCard>::new(),
        insight_notes: Vec::<InsightNote>::new(),
        model_explain_cards: vec![
            ExplainCard {
                title: "Canlı skor etkisi".to_string(),
                impact: format!("{}-{}", live_row.home_goals, live_row.away_goals),
                detail: "Canlı fallback modunda karar, skor ve dakika etkisiyle üretildi."
                    .to_string(),
                tone: "medium".to_string(),
            },
            ExplainCard {
                title: "Veri kısıtı".to_string(),
                impact: "Fallback".to_string(),
                detail: "Detay katmanları yüklenemediği için tahmin korunmalı çizgide tutuldu."
                    .to_string(),
                tone: "risky".to_string(),
            },
        ],
        net_kpis: vec![
            NetKpi {
                key: "fallback_confidence".to_string(),
                label: "Fallback güveni".to_string(),
                value: confidence,
                target: ">=60".to_string(),
                status: if confidence >= 60 {
                    "hit".to_string()
                } else {
                    "risk".to_string()
                },
                sample_size: 8,
                detail: "Canlı skor bazlı minimum güven hattı.".to_string(),
            },
            NetKpi {
                key: "fallback_coverage".to_string(),
                label: "Fallback kapsaması".to_string(),
                value: 42,
                target: ">=70".to_string(),
                status: "risk".to_string(),
                sample_size: 8,
                detail: "Detay ve kadro verileri olmadan hızlı mod aktif.".to_string(),
            },
        ],
        lineup_verification: None,
        disclaimer:
            "Canlı hızlı analiz skor ve dakikaya göre üretilir; kesin sonuç garantisi vermez."
                .to_string(),
    }
}

fn collect_live_event_adjustments(
    tracked_status: Option<&TrackedMatchStatus>,
    minute: u16,
    home_leading: bool,
    away_leading: bool,
) -> LiveEventAdjustments {
    let Some(status) = tracked_status else {
        return LiveEventAdjustments::default();
    };
    let recent_window = minute.saturating_sub(16);
    let mut recent_goals = 0u8;
    let mut red_home = 0u8;
    let mut red_away = 0u8;
    let mut recent_corner_home = 0u8;
    let mut recent_corner_away = 0u8;
    let mut penalties_missed = 0u8;

    for event in status.timeline_events.iter().rev().take(24) {
        let event_type = normalize_team_phrase(&event.event_type);
        let side = normalize_team_phrase(&event.side);
        let recent = event.minute_value >= recent_window;
        match event_type.as_str() {
            "goal" => {
                if recent {
                    recent_goals = recent_goals.saturating_add(1);
                }
            }
            "red" => {
                if side == "home" {
                    red_home = red_home.saturating_add(1);
                } else if side == "away" {
                    red_away = red_away.saturating_add(1);
                }
            }
            "corner" => {
                if recent {
                    if side == "home" {
                        recent_corner_home = recent_corner_home.saturating_add(1);
                    } else if side == "away" {
                        recent_corner_away = recent_corner_away.saturating_add(1);
                    }
                }
            }
            "penalty" => penalties_missed = penalties_missed.saturating_add(1),
            _ => {}
        }
    }

    let mut output = LiveEventAdjustments::default();
    if recent_goals > 0 {
        output.secondary_delta += 5;
        if minute < 46 {
            output.first_half_delta += 4;
        }
        output.secondary_note =
            Some("Son bölümde gol ivmesi var; ek gol hattı güçlendi.".to_string());
    }

    if red_home > 0 || red_away > 0 {
        output.secondary_delta += 6;
        if (home_leading && red_home > 0) || (away_leading && red_away > 0) {
            output.result_delta -= 11;
            output.result_note =
                Some("Önde olan tarafta kart riski var; maç sonu kapanışı düşürüldü.".to_string());
        } else {
            output.result_delta += 7;
            output.result_note = Some("Kart dengesi önde olan taraf lehine döndü.".to_string());
        }
    }

    if penalties_missed > 0 {
        output.secondary_delta += 3;
        output.result_delta -= 4;
        if output.result_note.is_none() {
            output.result_note = Some(
                "Kaçan penaltı sonrası skor kırılganlığı arttı; tek taraf kapanışı zayıfladı."
                    .to_string(),
            );
        }
    }

    let trailing_corner_pressure = if home_leading {
        recent_corner_away
    } else if away_leading {
        recent_corner_home
    } else {
        recent_corner_home.max(recent_corner_away)
    };
    if trailing_corner_pressure >= 3 {
        output.secondary_delta += 4;
        output.result_delta -= 5;
        let pressure_note = "Korner baskısı geri dönüş ihtimalini canlı tuttu.".to_string();
        output.secondary_note = Some(match output.secondary_note {
            Some(existing) => format!("{existing} {pressure_note}"),
            None => pressure_note,
        });
    }

    output
}

fn build_live_market_plan(
    live_row: &MackolikLiveRow,
    _matched: Option<&MackolikListedMatch>,
    analysis: &AnalysisResponse,
    tracked_status: Option<&TrackedMatchStatus>,
) -> LiveMarketPlan {
    let minute = parse_live_minute_value(&live_row.minute_label);
    let total_goals = live_row.home_goals as f64 + live_row.away_goals as f64;
    let goal_gap = live_row.home_goals.abs_diff(live_row.away_goals);
    let home_leading = live_row.home_goals > live_row.away_goals;
    let away_leading = live_row.away_goals > live_row.home_goals;
    let next_total_line = total_goals + 0.5;
    let event_adjustments =
        collect_live_event_adjustments(tracked_status, minute, home_leading, away_leading);

    let (first_half_label, first_half_probability, first_half_note) = if minute < 46 {
        let base_probability = live_goal_pressure_probability(minute, total_goals as u8);
        (
            format!("İlk Yarı {:.1} Üst", next_total_line),
            clamp_u8_i16(base_probability, event_adjustments.first_half_delta, 24, 94),
            format!(
                "{} ve skor {}-{}. Devreye kadar bir gol daha gelirse hat açılır.",
                live_row.minute_label, live_row.home_goals, live_row.away_goals
            ),
        )
    } else {
        (
            "İlk yarı pazarı kapandı".to_string(),
            0,
            "İlk yarı tamamlandığı için bu pazar artık değerlendirme dışı.".to_string(),
        )
    };

    let secondary_probability_base = live_goal_pressure_probability(minute, total_goals as u8)
        .saturating_sub(if total_goals >= 4.0 { 5 } else { 2 })
        .max(36);
    let secondary_label = if total_goals >= 4.0 {
        format!("Maç Sonu {:.1} Üst", next_total_line)
    } else {
        format!("Maç Sonu {:.1} Üst", (total_goals.floor() + 1.5).max(2.5))
    };
    let mut secondary_note = format!(
        "{} ve skor {}-{} için bir sonraki toplam gol hattı izleniyor.",
        live_row.minute_label, live_row.home_goals, live_row.away_goals
    );
    let secondary_probability = clamp_u8_i16(
        secondary_probability_base,
        event_adjustments.secondary_delta,
        30,
        96,
    );
    if let Some(extra_note) = event_adjustments.secondary_note.as_ref() {
        secondary_note = format!("{secondary_note} {extra_note}");
    }

    let (result_label, result_probability_base, mut result_note) = if goal_gap >= 2 && minute >= 65
    {
        if home_leading {
            (
                format!("{} kazanır", live_row.home_team),
                78,
                format!(
                    "{} önde ve fark iki top. Yine de maç sonu kapanışı kart/tempo riskiyle kontrol ediliyor.",
                    live_row.home_team
                ),
            )
        } else {
            (
                format!("{} kazanır", live_row.away_team),
                78,
                format!(
                    "{} önde ve fark iki top. Yine de maç sonu kapanışı kart/tempo riskiyle kontrol ediliyor.",
                    live_row.away_team
                ),
            )
        }
    } else if goal_gap == 1 && minute >= 70 {
        if home_leading {
            (
                format!("{} yenilmez", live_row.home_team),
                72,
                "Önde olan taraf için korumalı çizgi öne çıkıyor; erken maç sonu kapanışı yapılmadı."
                    .to_string(),
            )
        } else {
            (
                format!("{} yenilmez", live_row.away_team),
                72,
                "Önde olan deplasman için korumalı çizgi öne çıkıyor; erken maç sonu kapanışı yapılmadı."
                    .to_string(),
            )
        }
    } else if goal_gap == 1 && minute >= 55 {
        let leader = if home_leading {
            live_row.home_team.as_str()
        } else {
            live_row.away_team.as_str()
        };
        (
            format!("{leader} yenilmez"),
            66,
            "Skor avantajı var ancak tempo/kart kırılımı henüz maçı kilitlemiyor.".to_string(),
        )
    } else if live_row.home_goals == live_row.away_goals {
        (
            "Beraberlik".to_string(),
            analysis.probabilities.draw.max(34),
            "Skor dengede. Net taraf yerine maç akışı izlenmeli.".to_string(),
        )
    } else {
        let leader = if home_leading {
            live_row.home_team.as_str()
        } else {
            live_row.away_team.as_str()
        };
        (
            format!("{leader} yenilmez"),
            62,
            "Skor avantajı var ama maç tamamen kapanmış değil.".to_string(),
        )
    };
    let result_probability = clamp_u8_i16(
        result_probability_base,
        event_adjustments.result_delta,
        32,
        95,
    );
    if let Some(extra_note) = event_adjustments.result_note.as_ref() {
        result_note = format!("{result_note} {extra_note}");
    }

    let live_comment = if minute < 46 {
        format!(
            "{} ve skor {}-{}. Devreye kadar ana hat {} (%{}). Risk: tempo düşerse ilk yarı pazarı bozulur.",
            live_row.minute_label,
            live_row.home_goals,
            live_row.away_goals,
            first_half_label,
            first_half_probability
        )
    } else {
        format!(
            "{} ve skor {}-{}. Şu an ana hat {} (%{}). Ek gol gelirse {} (%{}) tekrar masaya girer.",
            live_row.minute_label,
            live_row.home_goals,
            live_row.away_goals,
            result_label,
            result_probability,
            secondary_label,
            secondary_probability
        )
    };
    LiveMarketPlan {
        first_half_label,
        first_half_probability,
        first_half_note,
        secondary_label,
        secondary_probability,
        secondary_note,
        result_label,
        result_probability,
        result_note,
        live_comment,
    }
}

fn live_goal_pressure_probability(minute: u16, total_goals: u8) -> u8 {
    let base = if minute <= 15 {
        72
    } else if minute <= 30 {
        66
    } else if minute <= 45 {
        58
    } else if minute <= 60 {
        61
    } else if minute <= 75 {
        54
    } else {
        42
    };
    (base + total_goals.saturating_mul(4)).min(94)
}

fn tracked_score_text(home_goals: Option<u8>, away_goals: Option<u8>) -> Option<String> {
    match (home_goals, away_goals) {
        (Some(home), Some(away)) => Some(format!("{home}-{away}")),
        _ => None,
    }
}

fn build_tracked_timeline_events_from_live_row(
    live_row: &MackolikLiveRow,
    matched: Option<&MackolikListedMatch>,
) -> Vec<TrackedTimelineEvent> {
    let state = parse_mackolik_live_state(&live_row.minute_label);
    let minute_value = parse_live_minute_value(&live_row.minute_label).min(120);
    let minute = if minute_value > 0 {
        format!("{}'", minute_value)
    } else {
        live_row.minute_label.clone()
    };
    let score = Some(format!("{}-{}", live_row.home_goals, live_row.away_goals));
    let mut events = Vec::new();

    match state.as_str() {
        "finished" => {
            events.push(TrackedTimelineEvent {
                minute: "90+".to_string(),
                minute_value: 90,
                event_type: "fulltime".to_string(),
                side: "neutral".to_string(),
                label: "Maç sonu".to_string(),
                note: format!(
                    "Final skor {} olarak işlendi.",
                    score.clone().unwrap_or_else(|| "-".to_string())
                ),
                score: score.clone(),
            });
        }
        "halftime" => {
            events.push(TrackedTimelineEvent {
                minute: "45+".to_string(),
                minute_value: 45,
                event_type: "halftime".to_string(),
                side: "neutral".to_string(),
                label: "İlk yarı".to_string(),
                note: format!(
                    "İlk yarı skoru {} olarak işlendi.",
                    score.clone().unwrap_or_else(|| "-".to_string())
                ),
                score: score.clone(),
            });
        }
        "live" => {
            let side = if live_row.home_goals > live_row.away_goals {
                "home"
            } else if live_row.away_goals > live_row.home_goals {
                "away"
            } else {
                "neutral"
            };
            events.push(TrackedTimelineEvent {
                minute: minute.clone(),
                minute_value,
                event_type: if live_row.home_goals > 0 || live_row.away_goals > 0 {
                    "goal".to_string()
                } else {
                    "update".to_string()
                },
                side: side.to_string(),
                label: "Canlı durum".to_string(),
                note: format!(
                    "Canlı skor {} ve durum {} olarak işlendi.",
                    score.clone().unwrap_or_else(|| "0-0".to_string()),
                    live_row.minute_label
                ),
                score: score.clone(),
            });
        }
        _ => {
            events.push(TrackedTimelineEvent {
                minute: live_row.minute_label.clone(),
                minute_value,
                event_type: "update".to_string(),
                side: "neutral".to_string(),
                label: "Durum".to_string(),
                note: format!("Durum etiketi {} olarak işlendi.", live_row.minute_label),
                score: score.clone(),
            });
        }
    }

    let update_note = if let Some(item) = matched {
        format!(
            "Canlı durum {} güncellendi. Lig: {}.",
            score.clone().unwrap_or_else(|| "-".to_string()),
            item.league
        )
    } else {
        format!(
            "Canlı durum {} güncellendi.",
            score.clone().unwrap_or_else(|| "-".to_string())
        )
    };

    events.push(TrackedTimelineEvent {
        minute: if state == "finished" {
            "90+".to_string()
        } else if state == "halftime" {
            "45+".to_string()
        } else {
            minute
        },
        minute_value: if state == "finished" {
            90
        } else {
            minute_value
        },
        event_type: "update".to_string(),
        side: "neutral".to_string(),
        label: "Son durum".to_string(),
        note: update_note,
        score,
    });

    events.sort_by(|left, right| left.minute_value.cmp(&right.minute_value));
    events
}

fn build_tracked_timeline_events_from_listed_match(
    item: &MackolikListedMatch,
    state: &str,
    request: &TrackedMatchRequest,
) -> Vec<TrackedTimelineEvent> {
    let score = tracked_score_text(item.home_goals, item.away_goals);
    if state == "finished" {
        return vec![
            TrackedTimelineEvent {
                minute: "90+".to_string(),
                minute_value: 90,
                event_type: "fulltime".to_string(),
                side: "neutral".to_string(),
                label: "Maç sonu".to_string(),
                note: format!(
                    "Final skor {} olarak işlendi.",
                    score.clone().unwrap_or_else(|| "-".to_string())
                ),
                score: score.clone(),
            },
            TrackedTimelineEvent {
                minute: "90+".to_string(),
                minute_value: 90,
                event_type: "update".to_string(),
                side: "neutral".to_string(),
                label: "Son durum".to_string(),
                note: "Maç tamamlandı ve takip kaydı final skorla güncellendi.".to_string(),
                score,
            },
        ];
    }

    let kickoff = request
        .match_time
        .clone()
        .filter(|value| !value.trim().is_empty())
        .unwrap_or_else(|| item.match_time.clone());

    vec![TrackedTimelineEvent {
        minute: kickoff.clone(),
        minute_value: 0,
        event_type: "update".to_string(),
        side: "neutral".to_string(),
        label: "Başlama".to_string(),
        note: format!("Başlama saati {} olarak görünüyor.", kickoff),
        score,
    }]
}

fn build_tracked_status_from_live_row(
    live_row: &MackolikLiveRow,
    matched: Option<&MackolikListedMatch>,
    note: &str,
    id_hint: Option<&str>,
) -> TrackedMatchStatus {
    let state = parse_mackolik_live_state(&live_row.minute_label);
    let halftime_score = if state == "halftime" {
        Some(format!("{}-{}", live_row.home_goals, live_row.away_goals))
    } else {
        None
    };
    TrackedMatchStatus {
        id: id_hint.map(|value| value.to_string()).unwrap_or_else(|| {
            format!(
                "{}-{}",
                normalize_team_name(&live_row.home_team),
                normalize_team_name(&live_row.away_team)
            )
        }),
        found: true,
        source: "mackolik".to_string(),
        state: state.clone(),
        status_label: if state == "finished" {
            "MS".to_string()
        } else if state == "halftime" {
            "İY".to_string()
        } else {
            live_row.minute_label.clone()
        },
        home_goals: Some(live_row.home_goals),
        away_goals: Some(live_row.away_goals),
        halftime_score,
        home_team_id: live_row.home_team_id,
        away_team_id: live_row.away_team_id,
        home_logo_url: None,
        away_logo_url: None,
        mackolik_match_page_id: Some(live_row.match_page_id),
        matchcast_id: matched.and_then(|item| item.event_id),
        timeline_events: build_tracked_timeline_events_from_live_row(live_row, matched),
        note: note.to_string(),
    }
}

fn parse_mackolik_listed_state(
    item: &MackolikListedMatch,
    request: &TrackedMatchRequest,
) -> (String, String) {
    let raw_status = item.match_status.trim();
    let normalized = normalize_team_phrase(raw_status);
    let today = today_iso_date();

    if !raw_status.is_empty() {
        if status_indicates_finished(&normalized) {
            return ("finished".to_string(), "MS".to_string());
        }
        if normalized.contains("iy") || normalized.contains("devre") || normalized == "ht" {
            return ("halftime".to_string(), "İY".to_string());
        }
        if normalized.contains("ert")
            || normalized.contains("ipt")
            || normalized.contains("tatil")
            || normalized.contains("ask")
            || normalized.contains("suspend")
        {
            return ("suspended".to_string(), raw_status.to_string());
        }
        let minute = parse_live_minute_value(raw_status);
        if minute > 0 {
            return ("live".to_string(), format!("{}'", minute));
        }
    }

    let kickoff = request
        .match_time
        .clone()
        .filter(|value| !value.trim().is_empty())
        .unwrap_or_else(|| item.match_time.clone());

    if item.match_date < today {
        let has_score_pair = item.home_goals.is_some() && item.away_goals.is_some();
        let has_non_zero_score = matches!(
            (item.home_goals, item.away_goals),
            (Some(home), Some(away)) if home > 0 || away > 0
        );
        if status_indicates_finished(&normalized) || has_non_zero_score {
            return ("finished".to_string(), "MS".to_string());
        }
        if has_score_pair {
            return ("missing".to_string(), "Skor doğrulanamadı".to_string());
        }
        return ("missing".to_string(), "Doğrulanamadı".to_string());
    }
    ("scheduled".to_string(), kickoff)
}

fn build_tracked_status_from_listed_match(
    item: &MackolikListedMatch,
    request: &TrackedMatchRequest,
) -> TrackedMatchStatus {
    let (state, status_label) = parse_mackolik_listed_state(item, request);
    TrackedMatchStatus {
        id: request.id.clone(),
        found: true,
        source: "mackolik".to_string(),
        state: state.clone(),
        status_label,
        home_goals: item.home_goals,
        away_goals: item.away_goals,
        halftime_score: if state == "halftime" {
            tracked_score_text(item.home_goals, item.away_goals)
        } else {
            None
        },
        home_team_id: item.home_team_id,
        away_team_id: item.away_team_id,
        home_logo_url: None,
        away_logo_url: None,
        mackolik_match_page_id: Some(item.match_page_id),
        matchcast_id: item.event_id,
        timeline_events: build_tracked_timeline_events_from_listed_match(item, &state, request),
        note: match state.as_str() {
            "finished" => "Maç sonucu güncellendi.".to_string(),
            "scheduled" => "Maç başlama bilgisi güncellendi.".to_string(),
            "halftime" => "İlk yarı durumu güncellendi.".to_string(),
            "live" => "Canlı durum listeden okundu.".to_string(),
            _ => "Maç durumu güncellendi.".to_string(),
        },
    }
}

fn tracked_match_matches_live(item: &MackolikLiveRow, request: &TrackedMatchRequest) -> bool {
    if request
        .mackolik_match_page_id
        .map(|value| value == item.match_page_id)
        .unwrap_or(false)
    {
        return true;
    }

    let state = parse_mackolik_live_state(&item.minute_label);
    (request.home_team == item.home_team || team_name_matches(&request.home_team, &item.home_team))
        && (request.away_team == item.away_team
            || team_name_matches(&request.away_team, &item.away_team))
        && matches!(state.as_str(), "live" | "halftime")
}

fn tracked_match_matches_listed(item: &MackolikListedMatch, request: &TrackedMatchRequest) -> bool {
    if request
        .mackolik_match_page_id
        .map(|value| value == item.match_page_id)
        .unwrap_or(false)
    {
        return true;
    }

    let same_teams = (request.home_team == item.home_team
        || team_name_matches(&request.home_team, &item.home_team))
        && (request.away_team == item.away_team
            || team_name_matches(&request.away_team, &item.away_team));
    let same_date = request.match_date.trim().is_empty() || request.match_date == item.match_date;
    same_teams && same_date
}

fn fetch_text_with_headers(
    client: &Client,
    url: &str,
    headers: Option<&HeaderMap>,
) -> Result<String, String> {
    let mut request = client.get(url);
    if let Some(headers) = headers {
        request = request.headers(headers.clone());
    }
    request
        .send()
        .and_then(|response| response.error_for_status())
        .map_err(|error| format!("Bağlantı verisi çekilemedi: {error}"))?
        .text()
        .map_err(|error| format!("Bağlantı verisi okunamadı: {error}"))
}

fn format_unix_seconds_date_tr(timestamp_seconds: i64) -> String {
    format_unix_millis_date(timestamp_seconds.saturating_mul(1000))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn sample_listed_match(
        match_date: &str,
        match_time: &str,
        status: &str,
        home_goals: Option<u8>,
        away_goals: Option<u8>,
    ) -> MackolikListedMatch {
        MackolikListedMatch {
            match_page_id: 11,
            event_id: Some(22),
            sport_id: 1,
            home_team_id: Some(101),
            away_team_id: Some(202),
            home_team: "Ev".to_string(),
            away_team: "Dep".to_string(),
            home_goals,
            away_goals,
            match_date: match_date.to_string(),
            match_time: match_time.to_string(),
            match_status: status.to_string(),
            league: "Test Lig".to_string(),
        }
    }

    fn sample_request(match_date: &str, match_time: &str) -> TrackedMatchRequest {
        TrackedMatchRequest {
            id: "test-id".to_string(),
            home_team: "Ev".to_string(),
            away_team: "Dep".to_string(),
            match_date: match_date.to_string(),
            match_time: Some(match_time.to_string()),
            league: Some("Test Lig".to_string()),
            url: None,
            mackolik_match_page_id: Some(11),
            matchcast_id: Some(22),
        }
    }

    #[test]
    fn status_indicates_finished_is_not_triggered_by_penalty_waiting_text() {
        let normalized = normalize_team_phrase("Penaltı bekleniyor");
        assert!(!status_indicates_finished(&normalized));
    }

    #[test]
    fn parse_mackolik_live_state_supports_finished_tokens() {
        assert_eq!(parse_mackolik_live_state("MS"), "finished");
        assert_eq!(parse_mackolik_live_state("Penaltılar"), "finished");
        assert_eq!(parse_mackolik_live_state("90+4"), "live");
    }

    #[test]
    fn parse_mackolik_listed_state_past_match_without_score_is_missing() {
        let listed = sample_listed_match("2001-01-01", "20:00", "", None, None);
        let request = sample_request("2001-01-01", "20:00");
        let (state, label) = parse_mackolik_listed_state(&listed, &request);
        assert_eq!(state, "missing");
        assert_eq!(label, "Doğrulanamadı");
    }

    #[test]
    fn parse_mackolik_listed_state_past_match_with_score_is_finished() {
        let listed = sample_listed_match("2001-01-01", "20:00", "", Some(2), Some(1));
        let request = sample_request("2001-01-01", "20:00");
        let (state, label) = parse_mackolik_listed_state(&listed, &request);
        assert_eq!(state, "finished");
        assert_eq!(label, "MS");
    }

    #[test]
    fn parse_mackolik_listed_state_past_zero_zero_without_status_is_missing() {
        let listed = sample_listed_match("2001-01-01", "20:00", "", Some(0), Some(0));
        let request = sample_request("2001-01-01", "20:00");
        let (state, label) = parse_mackolik_listed_state(&listed, &request);
        assert_eq!(state, "missing");
        assert_eq!(label, "Skor doğrulanamadı");
    }

    #[test]
    fn parse_mackolik_listed_state_past_zero_zero_with_ms_is_finished() {
        let listed = sample_listed_match("2001-01-01", "20:00", "MS", Some(0), Some(0));
        let request = sample_request("2001-01-01", "20:00");
        let (state, label) = parse_mackolik_listed_state(&listed, &request);
        assert_eq!(state, "finished");
        assert_eq!(label, "MS");
    }

    #[test]
    fn parse_mackolik_listed_state_future_match_stays_scheduled() {
        let listed = sample_listed_match("2999-01-01", "21:45", "", None, None);
        let request = sample_request("2999-01-01", "21:45");
        let (state, label) = parse_mackolik_listed_state(&listed, &request);
        assert_eq!(state, "scheduled");
        assert_eq!(label, "21:45");
    }

    #[test]
    fn parse_score_pair_from_text_supports_dash_and_colon() {
        assert_eq!(parse_score_pair_from_text("2-1"), Some((2, 1)));
        assert_eq!(parse_score_pair_from_text("3 : 0"), Some((3, 0)));
        assert_eq!(parse_score_pair_from_text("skor yok"), None);
    }

    #[test]
    fn parse_mackolik_detail_event_seed_maps_penalty_miss_as_penalty() {
        let row = vec![
            Value::from(1),
            Value::from(67),
            Value::Null,
            Value::from("Test Oyuncu"),
            Value::from(7),
            Value::Object(serde_json::Map::new()),
        ];
        let mut home = 1u8;
        let mut away = 0u8;
        let event = parse_mackolik_detail_event_seed(&row, &mut home, &mut away)
            .expect("penalty event should be parsed");
        assert_eq!(event.event_type, "penalty");
        assert_eq!(event.label, "Kaçan penaltı");
    }

    #[test]
    fn parse_mackolik_detail_event_seed_detects_corner_from_text() {
        let row = vec![
            Value::from(2),
            Value::from(55),
            Value::from("Korner"),
            Value::from(""),
            Value::from(9),
            Value::Object(serde_json::Map::new()),
        ];
        let mut home = 0u8;
        let mut away = 0u8;
        let event = parse_mackolik_detail_event_seed(&row, &mut home, &mut away)
            .expect("corner event should be parsed");
        assert_eq!(event.event_type, "corner");
        assert_eq!(event.label, "Korner");
    }
}
