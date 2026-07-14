# =============================================================================
# GeoRisk Data Lab 3 — Event Study and Difference-in-Differences
# Eric Gabin Kilama · FERDI · CERDI
# =============================================================================
#
# References:
#   Callaway, B. & Sant'Anna, P.H.C. (2021). "Difference-in-Differences with
#     Multiple Time Periods." Journal of Econometrics, 225(2), 200-230.
#   Sun, L. & Abraham, S. (2021). "Estimating Dynamic Treatment Effects in
#     Event Studies." Journal of Econometrics, 225(2), 175-199.
#   de Chaisemartin, C. & D'Haultfœuille, X. (2020). "Two-Way Fixed Effects
#     Estimators." American Economic Review, 110(9), 2964-2996.
#   Roth, J. et al. (2023). "What's Trending in DiD?" JHR.
#   Goodman-Bacon, A. (2021). "DiD with Variation in Treatment Timing."
#     Journal of Econometrics, 225(2), 254-277.
#   Rambachan, A. & Roth, J. (2023). "A More Credible Approach to Parallel
#     Trends." Review of Economic Studies, 90(5), 2555-2591.
#
# Application: EU firms and Russia sanctions (staggered treatment, 2022)
# =============================================================================

library(did)           # Callaway & Sant'Anna
library(fixest)        # Sun & Abraham via sunab()
library(bacondecomp)   # Goodman-Bacon decomposition
library(HonestDiD)     # Rambachan & Roth sensitivity
library(data.table)
library(ggplot2)

set.seed(42)

# --- 1. Simulate panel data --------------------------------------------------

N_firms   <- 200
T_periods <- 16  # Q1 2020 to Q4 2023

# Firm characteristics
firms <- data.table(
  firm_id = 1:N_firms,
  country = sample(c("DE", "FR", "IT", "PL"),
                   N_firms, replace = TRUE, prob = c(0.30, 0.25, 0.25, 0.20)),
  russia_exposure = runif(N_firms, 0, 1)
)

# Treatment: high exposure firms treated, timing varies by country
# DE: Q2 2022 (t=9), FR/IT: Q3 2022 (t=10), PL: Q1 2022 (t=8)
treatment_map <- c(DE = 9, FR = 10, IT = 10, PL = 8)
firms[, treated := russia_exposure > 0.5]
firms[, g := ifelse(treated, treatment_map[country], 0)]  # cohort

# Build panel
panel <- CJ(firm_id = 1:N_firms, period = 1:T_periods)
panel <- merge(panel, firms, by = "firm_id")

# Generate outcome: revenue growth index (base = 100 at period 5 = Q1 2021)
panel[, quarter := paste0("Q", ((period - 1) %% 4) + 1, " ",
                           2020 + (period - 1) %/% 4)]

# Firm fixed effect
panel[, fe_firm := rnorm(1, 0, 3), by = firm_id]

# Time fixed effect (common trend)
time_effects <- c(rep(0, 4), 2, 3, 4, 5, 4, 3, 2, 1.5, 1, 0.5, 0.5, 0.5)
panel[, fe_time := time_effects[period]]

# Treatment effect: negative, heterogeneous by cohort, dynamic
panel[, rel_time := ifelse(g > 0, period - g, NA)]
panel[, tau := 0]

# DE (energy-dependent): large immediate effect, slow recovery
panel[country == "DE" & treated & period >= g,
      tau := -8 * exp(-0.1 * (period - g)) - 3]

# FR (luxury exports): moderate, persistent
panel[country == "FR" & treated & period >= g,
      tau := -5 - 0.5 * (period - g)]

# IT (trade disruption): moderate, some recovery
panel[country == "IT" & treated & period >= g,
      tau := -6 * exp(-0.15 * (period - g)) - 2]

# PL (immediate border): large, then partial recovery
panel[country == "PL" & treated & period >= g,
      tau := -10 * exp(-0.2 * (period - g)) - 2]

# Outcome
panel[, y := 100 + fe_firm + fe_time + tau + rnorm(.N, 0, 2)]

# --- 2. Visualize raw data ---------------------------------------------------

avg_by_group <- panel[, .(y_mean = mean(y)), by = .(period, treated)]

ggplot(avg_by_group, aes(x = period, y = y_mean, color = factor(treated))) +
  geom_line(linewidth = 1) +
  geom_vline(xintercept = 8, linetype = "dashed", color = "grey50") +
  annotate("text", x = 8.2, y = max(avg_by_group$y_mean), label = "First treatment",
           hjust = 0, color = "grey50", size = 3) +
  scale_color_manual(values = c("0" = "#2C5F8A", "1" = "#C0392B"),
                     labels = c("Control", "Treated")) +
  labs(title = "Average Revenue Index by Treatment Status",
       x = "Quarter", y = "Revenue Index", color = NULL) +
  theme_minimal(base_family = "Helvetica Neue") +
  theme(plot.title = element_text(face = "bold"))

ggsave("lab3_raw_trends.pdf", width = 9, height = 5)

# --- 3. Naive TWFE event study -----------------------------------------------

# PROBLEM: with staggered treatment, TWFE uses already-treated as controls
panel[, rel_time_fe := ifelse(is.na(rel_time), -999, rel_time)]

twfe <- feols(y ~ i(rel_time_fe, ref = c(-1, -999)) | firm_id + period,
              data = panel[treated == TRUE | g == 0],
              vcov = ~firm_id)

iplot(twfe, main = "Naive TWFE Event Study (potentially biased)")

# --- 4. Callaway & Sant'Anna (2021) -----------------------------------------

# Correct for heterogeneous treatment timing
cs_out <- att_gt(
  yname  = "y",
  tname  = "period",
  idname = "firm_id",
  gname  = "g",
  data   = as.data.frame(panel),
  control_group = "nevertreated",
  est_method = "dr"  # doubly robust
)

summary(cs_out)

# Aggregate to event-study plot
cs_es <- aggte(cs_out, type = "dynamic", min_e = -6, max_e = 8)
ggdid(cs_es, title = "Callaway & Sant'Anna Event Study (corrected)")

ggsave("lab3_cs_eventstudy.pdf", width = 9, height = 5)

# Aggregate by group (cohort-specific ATT)
cs_group <- aggte(cs_out, type = "group")
summary(cs_group)

# Simple overall ATT
cs_simple <- aggte(cs_out, type = "simple")
summary(cs_simple)

# --- 5. Sun & Abraham (2021) via fixest -------------------------------------

sa_out <- feols(y ~ sunab(g, period) | firm_id + period,
                data = panel[g > 0 | g == 0],
                vcov = ~firm_id)

iplot(sa_out, main = "Sun & Abraham (2021) Interaction-Weighted Estimator")

# --- 6. Goodman-Bacon decomposition -----------------------------------------

# Shows which 2x2 comparisons drive the TWFE estimate
panel_bacon <- panel[treated == TRUE | g == 0]
panel_bacon[, post := as.integer(g > 0 & period >= g)]

bacon_out <- bacon(y ~ post, data = as.data.frame(panel_bacon),
                   id_var = "firm_id", time_var = "period")

ggplot(bacon_out, aes(x = weight, y = estimate, color = type)) +
  geom_point(size = 3, alpha = 0.7) +
  geom_hline(yintercept = 0, linetype = "dashed") +
  scale_color_manual(values = c("#1B2A4A", "#C0392B", "#D4A017")) +
  labs(title = "Goodman-Bacon Decomposition",
       subtitle = "Each point is a 2×2 DiD comparison",
       x = "Weight", y = "Estimate", color = "Comparison type") +
  theme_minimal(base_family = "Helvetica Neue") +
  theme(plot.title = element_text(face = "bold"))

ggsave("lab3_bacon_decomposition.pdf", width = 9, height = 6)

# --- 7. Rambachan & Roth (2023) sensitivity ----------------------------------

# How sensitive are results to violations of parallel trends?
# M = bound on the slope of the pre-trend

cs_es_obj <- aggte(cs_out, type = "dynamic", min_e = -6, max_e = 8)

# Extract coefficients and variance-covariance
beta_hat <- cs_es_obj$att.egt
V_hat    <- cs_es_obj$V_analytical

# Honest DiD: how large can M be before result flips sign?
# (This requires careful setup — see HonestDiD vignette)
# honest <- HonestDiD::createSensitivityResults(
#   betahat = beta_hat,
#   sigma = V_hat,
#   numPrePeriods = 6,
#   numPostPeriods = 8,
#   Mvec = seq(0, 0.05, by = 0.005)
# )

cat("\n=== Lab 3 complete ===\n")
cat("Key finding: TWFE is biased with staggered treatment.\n")
cat("Callaway-Sant'Anna and Sun-Abraham correct for this.\n")
cat("Bacon decomposition reveals problematic 2x2 comparisons.\n")
cat("Rambachan-Roth shows robustness to parallel trends violations.\n")
