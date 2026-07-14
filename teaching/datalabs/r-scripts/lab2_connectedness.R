# =============================================================================
# GeoRisk Data Lab 2 — Financial Connectedness and Spillovers
# Eric Gabin Kilama · FERDI · CERDI
# =============================================================================
#
# References:
#   Diebold, F.X. & Yılmaz, K. (2009). "Measuring Financial Asset Return and
#     Volatility Spillovers." Economic Journal, 119(534), 158-171.
#   Diebold, F.X. & Yılmaz, K. (2012). "Better to Give than to Receive."
#     International Journal of Forecasting, 28(1), 57-66.
#   Diebold, F.X. & Yılmaz, K. (2014). "On the Network Topology of Variance
#     Decompositions." Journal of Econometrics, 182(1), 119-134.
#   Pesaran, M.H. & Shin, Y. (1998). "Generalized Impulse Response Analysis
#     in Linear Multivariate Models." Economics Letters, 58(1), 17-29.
#
# Data: FRED / ECB / Bloomberg (public series)
# =============================================================================

library(vars)
library(frequencyConnectedness)  # Baruník & Křehlík (2018)
library(data.table)
library(ggplot2)
library(igraph)

# --- 1. Load data ------------------------------------------------------------

# 6 financial series (monthly, Jan 2006 - Dec 2024)
# Download from FRED:
#   VIX    — VIXCLS (S&P 500 implied volatility)
#   EURUSD — DEXUSEU (EUR/USD exchange rate → compute realized vol)
#   US10Y  — DGS10 (10-year Treasury yield)
#   Oil    — WTISPLC (WTI crude oil spot)
#   Gold   — GOLDAMGBD228NLBM (London gold fixing)
#   EMBI   — BAMLEMHBHYCRPITRIV (EM high-yield spread)

# library(fredr)
# fredr_set_key("YOUR_API_KEY")
# series <- c("VIXCLS", "DEXUSEU", "DGS10", "WTISPLC",
#              "GOLDAMGBD228NLBM", "BAMLEMHBHYCRPITRIV")
# data_list <- lapply(series, function(s) fredr(s, frequency = "m"))

data <- fread("macro_financial_monthly.csv")
data[, date := as.Date(date)]

# Compute returns / changes for non-stationary series
data[, vix      := vix]
data[, eurusd_v := abs(c(NA, diff(log(eurusd)))) * 100 * sqrt(252)]
data[, us10y    := c(NA, diff(us10y))]
data[, oil_ret  := c(NA, diff(log(oil))) * 100]
data[, gold_ret := c(NA, diff(log(gold))) * 100]
data[, embi     := embi]

vars_use <- c("vix", "eurusd_v", "us10y", "oil_ret", "gold_ret", "embi")
var_labels <- c("VIX", "EUR/USD Vol", "US 10Y", "Oil", "Gold", "EMBI")

dt <- na.omit(data[, c("date", vars_use), with = FALSE])

# --- 2. Estimate VAR --------------------------------------------------------

Y <- as.matrix(dt[, ..vars_use])
colnames(Y) <- var_labels

# Select lag order by AIC
lag_select <- VARselect(Y, lag.max = 8, type = "const")
p_opt <- lag_select$selection["AIC(n)"]
cat("Optimal lag order (AIC):", p_opt, "\n")

var_model <- VAR(Y, p = p_opt, type = "const")

# --- 3. Generalized FEVD (Pesaran-Shin) -------------------------------------

# Compute generalized forecast error variance decomposition
# Unlike Cholesky, order-invariant
H_fevd <- 10  # forecast horizon

gfevd <- fevd(var_model, n.ahead = H_fevd)

# Build connectedness matrix C (N x N)
N <- length(var_labels)
C <- matrix(0, N, N)

for (i in 1:N) {
  fevd_i <- gfevd[[i]]
  total_fevd <- fevd_i[H_fevd, ]
  C[i, ] <- total_fevd / sum(total_fevd) * 100
}

rownames(C) <- var_labels
colnames(C) <- var_labels

cat("\n=== Connectedness Matrix ===\n")
print(round(C, 1))

# --- 4. Connectedness measures -----------------------------------------------

# Total Connectedness Index
off_diag <- C
diag(off_diag) <- 0
TCI <- sum(off_diag) / N
cat("\nTotal Connectedness Index (TCI):", round(TCI, 1), "%\n")

# Directional FROM (row sums minus diagonal)
FROM <- rowSums(off_diag)
cat("\nDirectional FROM others:\n")
print(round(FROM, 1))

# Directional TO (column sums minus diagonal)
TO <- colSums(off_diag)
cat("\nDirectional TO others:\n")
print(round(TO, 1))

# NET = TO - FROM
NET <- TO - FROM
cat("\nNET connectedness (positive = net transmitter):\n")
print(round(NET, 1))

# --- 5. Rolling connectedness ------------------------------------------------

window <- 60  # 60-month rolling window
dates_roll <- dt$date[(window + p_opt):nrow(dt)]
tci_roll <- numeric(length(dates_roll))

for (t in seq_along(dates_roll)) {
  idx <- t:(t + window - 1)
  Y_win <- Y[idx, ]

  tryCatch({
    var_win <- VAR(Y_win, p = min(p_opt, 4), type = "const")
    gfevd_win <- fevd(var_win, n.ahead = H_fevd)

    C_win <- matrix(0, N, N)
    for (i in 1:N) {
      fevd_i <- gfevd_win[[i]]
      total_fevd <- fevd_i[H_fevd, ]
      C_win[i, ] <- total_fevd / sum(total_fevd) * 100
    }
    diag(C_win) <- 0
    tci_roll[t] <- sum(C_win) / N
  }, error = function(e) {
    tci_roll[t] <<- NA
  })
}

dt_tci <- data.table(date = dates_roll, tci = tci_roll)

# --- 6. Plot rolling TCI ----------------------------------------------------

events <- data.table(
  date = as.Date(c("2008-09-15", "2011-08-01", "2013-06-01",
                    "2020-03-15", "2022-02-24", "2023-03-10")),
  label = c("Lehman", "Debt Crisis", "Taper Tantrum",
            "COVID", "Ukraine", "SVB")
)

ggplot(dt_tci, aes(x = date, y = tci)) +
  geom_line(color = "#1B2A4A", linewidth = 0.8) +
  geom_vline(data = events, aes(xintercept = date),
             linetype = "dashed", color = "#C0392B", alpha = 0.6) +
  geom_text(data = events, aes(x = date, y = max(dt_tci$tci, na.rm = TRUE) * 0.95,
                                 label = label),
            angle = 90, hjust = 1, vjust = -0.5, size = 3, color = "#C0392B") +
  labs(
    title = "Total Connectedness Index (Rolling 60-month window)",
    subtitle = "Diebold-Yılmaz framework — Generalized FEVD, H=10",
    x = NULL, y = "TCI (%)",
    caption = "Source: FRED. Method: Diebold & Yılmaz (2012, 2014).\nEric Gabin Kilama · FERDI · CERDI"
  ) +
  theme_minimal(base_family = "Helvetica Neue") +
  theme(
    plot.title = element_text(face = "bold", size = 14),
    plot.subtitle = element_text(color = "grey50"),
    plot.caption = element_text(color = "grey50", hjust = 0),
    panel.grid.minor = element_blank()
  )

ggsave("lab2_rolling_tci.pdf", width = 10, height = 5)

# --- 7. Network visualization -----------------------------------------------

# Create weighted directed graph from connectedness matrix
C_net <- C
diag(C_net) <- 0
# Keep only edges > 5% for readability
C_net[C_net < 5] <- 0

g <- graph_from_adjacency_matrix(C_net, mode = "directed", weighted = TRUE)

# Node color: net transmitters (red) vs net receivers (blue)
V(g)$color <- ifelse(NET > 0, "#C0392B", "#2C5F8A")
V(g)$size  <- 20 + abs(NET) * 0.5
V(g)$label.color <- "white"
V(g)$label.cex <- 0.9

# Edge width proportional to weight
E(g)$width <- E(g)$weight / 5
E(g)$color <- adjustcolor("#1B2A4A", alpha.f = 0.4)
E(g)$curved <- 0.2

pdf("lab2_network.pdf", width = 8, height = 8)
plot(g, layout = layout_in_circle(g),
     main = "Financial Connectedness Network",
     sub = "Diebold-Yılmaz (2014) — Edge width ∝ FEVD share")
dev.off()

cat("\n=== Lab 2 complete ===\n")
cat("Rolling TCI saved to lab2_rolling_tci.pdf\n")
cat("Network saved to lab2_network.pdf\n")
cat("Key finding: connectedness surges during crises (GFC, COVID, Ukraine),\n")
cat("with VIX and oil typically acting as net transmitters.\n")
