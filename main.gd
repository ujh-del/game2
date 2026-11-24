extends Node3D

const PROP_SCENE := preload("res://assets/village_props.glb")
const PLAYER_SPEED := 5.0

var player: CharacterBody3D
var camera: Camera3D
var score := 0
var keys := 0
var level := 1
var question_open := false
var level_scores: Array[int] = []
var question_data := [
	{"title":"第一關｜市集小管家", "prompt":"你有 20 枚心動幣，想買 12 枚的果汁。買完後還剩幾枚？", "answers":["6 枚", "8 枚", "10 枚"], "correct":1, "hint":"用 20 減掉 12，想想錢包還剩多少。", "lesson":"先計算支出，再確認剩餘資金。"},
	{"title":"第二關｜小小投資站", "prompt":"你有 10 枚心動幣，可以全部放進安全存錢箱，或投入 6 枚到種子攤位。哪個做法風險較低？", "answers":["全部放入安全存錢箱", "投入 6 枚，保留 4 枚", "借錢投入更多"], "correct":0, "hint":"分散與保留緊急用錢，可以降低風險。", "lesson":"投資前先保留需要的錢，並了解風險。"}
]

var score_label: Label
var key_label: Label
var level_label: Label
var prompt_label: Label
var feedback_label: Label
var panel: PanelContainer
var interaction_label: Label

func _ready() -> void:
	_build_world()
	_build_ui()
	_show_intro()

func _build_world() -> void:
	var env := WorldEnvironment.new()
	var environment := Environment.new()
	environment.background_mode = Environment.BG_COLOR
	environment.background_color = Color("#62bce7")
	environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	environment.ambient_light_color = Color("#d8f2ff")
	environment.ambient_light_energy = 0.8
	env.environment = environment
	add_child(env)

	var sun := DirectionalLight3D.new()
	sun.rotation_degrees = Vector3(-48, -28, 0)
	sun.light_energy = 1.5
	sun.shadow_enabled = true
	add_child(sun)

	var ground := MeshInstance3D.new()
	var plane := PlaneMesh.new()
	plane.size = Vector2(34, 24)
	ground.mesh = plane
	ground.material_override = _mat(Color("#73b85d"))
	ground.position = Vector3(0, -0.05, 0)
	add_child(ground)

	var props := PROP_SCENE.instantiate()
	props.position = Vector3(0, 0, 0)
	add_child(props)

	player = CharacterBody3D.new()
	player.name = "Player"
	player.position = Vector3(0, 0.8, 8)
	add_child(player)
	var body := MeshInstance3D.new()
	var capsule := CapsuleMesh.new()
	capsule.height = 1.6
	capsule.radius = 0.35
	body.mesh = capsule
	body.material_override = _mat(Color("#f6c453"))
	body.position.y = 0.8
	player.add_child(body)
	var collision := CollisionShape3D.new()
	var shape := CapsuleShape3D.new()
	shape.height = 1.6
	shape.radius = 0.35
	collision.shape = shape
	collision.position.y = 0.8
	player.add_child(collision)

	camera = Camera3D.new()
	camera.position = Vector3(0, 7.5, 12)
	camera.rotation_degrees = Vector3(-25, 0, 0)
	player.add_child(camera)
	camera.current = true

	var kiosk := MeshInstance3D.new()
	var box := BoxMesh.new()
	box.size = Vector3(2.4, 1.8, 1.5)
	kiosk.mesh = box
	kiosk.material_override = _mat(Color("#d65b4c"))
	kiosk.position = Vector3(0, 0.9, -4)
	add_child(kiosk)
	var sign_label := Label3D.new()
	sign_label.text = "理財互動站  E"
	sign_label.font_size = 48
	sign_label.modulate = Color("#fff4c2")
	sign_label.position = Vector3(0, 2.1, -4.8)
	sign_label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	add_child(sign_label)

func _mat(color: Color) -> StandardMaterial3D:
	var m := StandardMaterial3D.new()
	m.albedo_color = color
	m.roughness = 0.85
	return m

func _build_ui() -> void:
	var layer := CanvasLayer.new()
	add_child(layer)
	var top := ColorRect.new()
	top.color = Color(0.04, 0.12, 0.19, 0.82)
	top.position = Vector2(0, 0)
	top.size = Vector2(1280, 76)
	layer.add_child(top)
	level_label = _label(layer, "第 1 關｜市集小管家", Vector2(28, 18), 30, Color("#ffe39a"))
	score_label = _label(layer, "得分：0", Vector2(470, 20), 28, Color.WHITE)
	key_label = _label(layer, "KEY：0 / 2", Vector2(1000, 20), 28, Color("#9fe8ff"))
	interaction_label = _label(layer, "使用 WASD / 方向鍵移動，走到理財互動站按 E", Vector2(28, 650), 22, Color("#ffffff"))
	interaction_label.size = Vector2(900, 40)

	panel = PanelContainer.new()
	panel.position = Vector2(250, 160)
	panel.size = Vector2(780, 390)
	panel.visible = false
	layer.add_child(panel)
	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 34)
	margin.add_theme_constant_override("margin_right", 34)
	margin.add_theme_constant_override("margin_top", 28)
	margin.add_theme_constant_override("margin_bottom", 22)
	panel.add_child(margin)
	var box := VBoxContainer.new()
	box.add_theme_constant_override("separation", 18)
	margin.add_child(box)
	prompt_label = Label.new()
	prompt_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	prompt_label.add_theme_font_size_override("font_size", 26)
	box.add_child(prompt_label)
	for i in 3:
		var b := Button.new()
		b.name = "Answer%d" % i
		b.custom_minimum_size = Vector2(0, 54)
		b.add_theme_font_size_override("font_size", 22)
		b.pressed.connect(_answer_pressed.bind(i))
		box.add_child(b)
	feedback_label = Label.new()
	feedback_label.add_theme_font_size_override("font_size", 20)
	feedback_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	box.add_child(feedback_label)

func _label(parent: Node, text_value: String, pos: Vector2, size: int, color: Color) -> Label:
	var label := Label.new()
	label.text = text_value
	label.position = pos
	label.add_theme_font_size_override("font_size", size)
	label.add_theme_color_override("font_color", color)
	parent.add_child(label)
	return label

func _show_intro() -> void:
	interaction_label.text = "歡迎來到心動小鎮！先找到紅色理財互動站，按 E 開始第一關。"

func _physics_process(delta: float) -> void:
	if not player or question_open:
		return
	var input := Input.get_vector("move_left", "move_right", "move_forward", "move_back")
	player.velocity.x = input.x * PLAYER_SPEED
	player.velocity.z = input.y * PLAYER_SPEED
	player.move_and_slide()
	player.position.x = clamp(player.position.x, -14.0, 14.0)
	player.position.z = clamp(player.position.z, -9.0, 10.0)
	if player.position.distance_to(Vector3(0, player.position.y, -4)) < 3.2 and Input.is_action_just_pressed("interact"):
		_open_question()

func _open_question() -> void:
	question_open = true
	panel.visible = true
	var data: Dictionary = question_data[level - 1]
	level_label.text = data.title
	prompt_label.text = data.prompt
	feedback_label.text = "提示：" + data.hint
	for i in 3:
		(panel.get_child(0).get_child(0).get_child(i + 1) as Button).text = data.answers[i]

func _answer_pressed(index: int) -> void:
	if not question_open:
		return
	var data: Dictionary = question_data[level - 1]
	var answer_buttons := panel.get_child(0).get_child(0)
	if index == data.correct:
		score += 50
		keys += 1
		level_scores.append(50)
		feedback_label.text = "答對了！" + data.lesson + " 你取得一把 KEY！"
		feedback_label.add_theme_color_override("font_color", Color("#1e9c63"))
		_update_hud()
		(answer_buttons.get_child(index + 1) as Button).disabled = true
		await get_tree().create_timer(1.5).timeout
		panel.visible = false
		question_open = false
		if level < 2:
			level = 2
			level_label.text = "第 2 關｜小小投資站"
			interaction_label.text = "太棒了！前往同一座理財互動站，挑戰投資風險題。"
		else:
			_show_results()
	else:
		score = max(0, score - 10)
		feedback_label.text = "再想想看！" + data.hint + "（本次 -10 分）"
		feedback_label.add_theme_color_override("font_color", Color("#c84242"))
		_update_hud()

func _update_hud() -> void:
	score_label.text = "得分：%d" % score
	key_label.text = "KEY：%d / 2" % keys

func _show_results() -> void:
	level_label.text = "任務完成｜小小理財家成果"
	prompt_label.text = "恭喜完成兩關！\n\n總得分：%d / 100\n取得 KEY：%d / 2\n\n你的進步成果：\n✓ 能先計算支出與剩餘金額\n✓ 能辨識保留資金與投資風險的重要性\n✓ 遇到不確定時，會先看提示再做決定" % [score, keys]
	feedback_label.text = "可以再玩一次，試著不使用提示完成挑戰。"
	for i in 3:
		(panel.get_child(0).get_child(0).get_child(i + 1) as Button).visible = false
	panel.visible = true
	question_open = true
	interaction_label.text = "學習紀錄：理財不是賭運氣，而是先規劃、再決定。"
