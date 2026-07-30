SHELL := /bin/bash
TITLES := $(basename $(notdir $(wildcard titles/*.conf)))

.PHONY: help run all status
help:
	@echo "Targets:"
	@echo "  make run SLUG=history-of-the-yorubas   # run one title's pipeline"
	@echo "  make all                               # run every title in titles/"
	@echo "  make status                            # show each title's stage"

run:
	@test -n "$(SLUG)" || { echo "set SLUG=<slug>"; exit 1; }
	@./pipeline.sh $(SLUG)

all:
	@for s in $(TITLES); do ./pipeline.sh $$s || exit 1; done

status:
	@printf '%-34s %s\n' "TITLE" "STAGE"
	@for s in $(TITLES); do \
	  if [ -f "$$s/text/clean.txt" ]; then st="cleaned — review/Gate 3"; \
	  elif [ -d "$$s" ]; then st="scaffolded"; \
	  else st="config only"; fi; \
	  printf '%-34s %s\n' "$$s" "$$st"; \
	done
