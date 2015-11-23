var click_to_top = d3.select("body")
			.append("a")
			.attr("id", "click_to_top")
				.append("div")
				.attr("class", "control_button")
				.style({
					"width":"200px",
					"height":"125px",
					"background-color":"#777",
					"position":"fixed",
					"top":"0px"
				});