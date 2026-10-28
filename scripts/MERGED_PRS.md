# Merged contribution refresh

The hourly workflow excludes repositories owned by `tusharg007`. Public external
contributions are refreshed using the workflow's repository-scoped token.

`data/approved-private-prs.json` contains explicitly approved, previously verified
metadata only. Without a private read credential, the workflow preserves that
snapshot rather than deleting it or claiming it has fetched new private PRs.

To automatically refresh future contributions to `MyManah/manai-llm-server`, add
the Actions secret `MERGED_PRS_READ_TOKEN` in this profile repository. Use a
fine-grained token with access only to that employer repository and Pull requests:
read permission, subject to the employer's authorization and approval policy.
Do not reuse a broad personal token or commit credentials.

The refresh publishes only repository name, PR number and merge timestamp for
that approved private repository. It never publishes private PR titles, bodies,
branches, comments, diffs or URLs. Other private repositories are not queried.

Run `Refresh merged engineering contributions` manually after configuring the
secret. Scheduled checks run hourly; GitHub may delay scheduled jobs. The
portfolio reads the same sanitized JSON feed on page load.
